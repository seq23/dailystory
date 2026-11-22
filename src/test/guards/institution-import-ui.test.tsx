import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InstitutionRosterImport } from '@/components/InstitutionRosterImport';
const mocks=vi.hoisted(()=>({rpc:vi.fn(),invoke:vi.fn()}));
vi.mock('@/lib/institutions/api',()=>({institutionRpc:(...args:any[])=>mocks.rpc(...args)}));
vi.mock('@/integrations/supabase/client',()=>({supabase:{functions:{invoke:(...args:any[])=>mocks.invoke(...args)}}}));
beforeEach(()=>{mocks.rpc.mockResolvedValue(1);mocks.invoke.mockResolvedValue({data:{classlink:'not_connected'},error:null});});
afterEach(()=>{cleanup();vi.clearAllMocks();});
describe('institution roster import preview and persistence',()=>{
  it('previews a local CSV before saving, then imports the normalized rows into the chosen class',async()=>{
    const saved=vi.fn(async()=>{});render(<InstitutionRosterImport schoolId="fixture-school" classId="fixture-class" admin={false} onSaved={saved}/>);
    const file=new File(['external_id,display_name,school_grade\nfixture-a,Reader A,02'], 'fixture.csv',{type:'text/csv'});
    Object.defineProperty(file,'text',{value:async()=> 'external_id,display_name,school_grade\nfixture-a,Reader A,02'});
    fireEvent.change(screen.getByLabelText('CSV roster'),{target:{files:[file]}});
    await screen.findByText('Reader A');expect(mocks.rpc).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button',{name:'Import into this class'}));
    await waitFor(()=>expect(mocks.rpc).toHaveBeenCalledWith('institution_import_roster',{p_class:'fixture-class',p_rows:[{external_id:'fixture-a',display_name:'Reader A',school_grade:'2',reading_grade:null}]}));
    await waitFor(()=>expect(saved).toHaveBeenCalledTimes(1));expect(await screen.findByText(/1 enrollments added/)).toBeInTheDocument();
  });
  it('shows disconnected providers to admins and does not offer a provider request to teachers',async()=>{
    render(<InstitutionRosterImport schoolId="fixture-school" classId="fixture-class" admin onSaved={async()=>{}}/>);
    await screen.findByText(/ClassLink: Not connected/);expect(screen.queryByText(/Clever/)).not.toBeInTheDocument();expect(screen.queryByLabelText('Provider')).not.toBeInTheDocument();expect(screen.getByRole('button',{name:'Preview ClassLink roster'})).toBeDisabled();expect(mocks.invoke).toHaveBeenCalledWith('institution-roster',{body:{action:'status',schoolId:'fixture-school'}});
  });
  it('a failed status check reads as not connected and keeps CSV import open',async()=>{
    mocks.invoke.mockResolvedValue({data:null,error:new Error('down')});
    render(<InstitutionRosterImport schoolId="fixture-school" classId="fixture-class" admin onSaved={async()=>{}}/>);
    expect(await screen.findByRole('alert')).toHaveTextContent('CSV import is available');
    expect(screen.getByRole('button',{name:'Find classes'})).toBeDisabled();expect(screen.getByLabelText('CSV roster')).toBeEnabled();
  });
  it('rejects a bad CSV without offering to persist partial rows',async()=>{
    render(<InstitutionRosterImport schoolId="fixture-school" classId="fixture-class" admin={false} onSaved={async()=>{}}/>);
    const file=new File(['invalid'],'fixture.csv');Object.defineProperty(file,'text',{value:async()=> 'external_id,display_name\na,Reader A\na,Reader B'});
    fireEvent.change(screen.getByLabelText('CSV roster'),{target:{files:[file]}});
    expect(await screen.findByRole('alert')).toHaveTextContent('duplicate roster ID');expect(screen.queryByRole('button',{name:'Import into this class'})).not.toBeInTheDocument();expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it('an admin picks a ClassLink class from the school list instead of typing an ID, then previews it',async()=>{
    mocks.invoke.mockImplementation(async(_name:string,{body}:any)=>body.action==='status'?{data:{classlink:'configured'},error:null}
      :body.action==='classes'?{data:{classes:[{id:'sec-1',name:'Room 1'},{id:'sec-2',name:'Room 2'}]},error:null}
      :{data:{rows:[{external_id:'classlink:a',display_name:'Reader A',school_grade:'2',reading_grade:null}]},error:null});
    render(<InstitutionRosterImport schoolId="fixture-school" classId="fixture-class" admin onSaved={async()=>{}}/>);
    await screen.findByText(/ClassLink: Configured/);
    expect(screen.getByRole('button',{name:'Preview ClassLink roster'})).toBeDisabled();
    fireEvent.click(screen.getByRole('button',{name:'Find classes'}));
    fireEvent.change(await screen.findByLabelText('ClassLink class'),{target:{value:'sec-2'}});
    fireEvent.click(screen.getByRole('button',{name:'Preview ClassLink roster'}));
    await screen.findByText('Reader A');
    expect(mocks.invoke).toHaveBeenCalledWith('institution-roster',{body:{action:'preview',schoolId:'fixture-school',providerClassId:'sec-2'}});
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
});
