/**
 * Voice Data Loader
 * Loads the actual voice data from the user's provided files
 */

import type { VoiceDefinition, VoiceOverride } from './types';

export class VoiceDataLoader {
  /**
   * Load beginner voices (complete data from user's level 0 file)
   */
  static loadBeginnerVoices(): VoiceDefinition[] {
    return [
      {
        "id": "meadow_tales_beg_v1",
        "pn": "Keeper of Meadow Tales", 
        "vf": { "tone": [1,0], "cad": 9, "var": 3, "wp": [3], "fig": 0.3, "hum": 0.4, "warm": 0.95, "nar": 1 },
        "st": { "hk": [0], "tr": [0], "pz": [4], "ct": [0], "tw": [0], "en": [0,1] },
        "ch": { "hp": [0,2], "pov": "third", "dlg": [0,1], "arc": [0,1] },
        "wd": { "set": [1,2], "sc": "tiny", "mor": "implied", "lp": [0], "rp": [0,1] },
        "rd": { "rh": "none", "aa": 1, "rf": "just_a_little_more", "ono": [8,1,0], "sl": 1 },
        "eg": { "dir": 1, "lst": 0, "ip": ["point_meadow"], "contr": 0, "exag": 0 },
        "th": ["gentle animals","homey comfort","tiny hero"],
        "tg": [1,2,4,0],
        "uig": {
          "aff": { "u": 1.0, "c": 0.7, "a": 0.8, "f": 0.3, "h": 0.2 },
          "rules": {
            "u": { "m": "direct", "max": 6, "gap": 1 },
            "c": { "m": "direct", "max": 3, "gap": 2 },
            "a": { "m": "direct", "max": 2 },
            "f": { "m": "direct", "max": 1 },
            "h": { "m": "direct", "max": 1 }
          }
        },
        "src": ["Beatrix Potter"]
      },
      {
        "id": "goodnight_whisper_beg_v1",
        "pn": "The Goodnight Whisperer",
        "vf": { "tone": [2,3], "cad": 8, "var": 2, "wp": [3,2], "fig": 0.25, "hum": 0.2, "warm": 0.98, "nar": 1 },
        "st": { "hk": [1], "tr": [1], "pz": [0], "ct": [0], "tw": [], "en": [0] },
        "ch": { "hp": [5,1], "pov": "third", "dlg": [6], "arc": [2] },
        "wd": { "set": [0,5], "sc": "tiny", "mor": "implied", "lp": [6], "rp": [4,10] },
        "rd": { "rh": "none", "aa": 1, "rf": "goodnight_little_world", "ono": [3], "sl": 1 },
        "eg": { "dir": 1, "lst": 1, "ip": ["whisper_goodnight"], "contr": 0, "exag": 0 },
        "th": ["bedtime ritual","soothing rhythm"],
        "tg": [0,1],
        "uig": { 
          "aff": { "u": 1.0, "c": 0.6, "a": 0.4, "f": 0.2, "h": 0.1 }, 
          "rules": { 
            "u": { "m": "direct", "max": 6, "gap": 1 }, 
            "c": { "m": "direct", "max": 2, "gap": 3 }, 
            "a": { "m": "direct", "max": 1 }, 
            "f": { "m": "direct", "max": 0 }, 
            "h": { "m": "direct", "max": 0 } 
          } 
        },
        "src": ["Margaret Wise Brown"]
      },
      {
        "id": "bear_and_bee_beg_v1",
        "pn": "The Gentle Humorist",
        "vf": { "tone": [4,5], "cad": 10, "var": 3, "wp": [3], "fig": 0.3, "hum": 0.5, "warm": 0.9, "nar": 2 },
        "st": { "hk": [2], "tr": [6,5], "pz": [3], "ct": [2], "tw": [2], "en": [6] },
        "ch": { "hp": [4,2], "pov": "third", "dlg": [0,5], "arc": [1,5] },
        "wd": { "set": [7,6], "sc": "everyday", "mor": "implied", "lp": [], "rp": [6] },
        "rd": { "rh": "none", "aa": 1, "ono": [16,17], "sl": 1 },
        "eg": { "dir": 0, "lst": 0, "ip": ["what_would_you_say"], "contr": 1, "exag": 0 },
        "th": ["friendship","small problems","kind humor"],
        "tg": [6,2],
        "uig": { 
          "aff": { "u": 0.9, "c": 0.5, "a": 0.7, "f": 0.2, "h": 0.2 }, 
          "rules": { 
            "u": { "m": "direct", "max": 4, "gap": 1 }, 
            "c": { "m": "direct", "max": 2, "gap": 3 }, 
            "a": { "m": "direct", "max": 2 }, 
            "f": { "m": "direct", "max": 1 }, 
            "h": { "m": "direct", "max": 1 } 
          } 
        },
        "src": ["A. A. Milne"]
      }
    ];
  }

  /**
   * Load easy overrides (delta format from user's level 1 file)  
   */
  static loadEasyOverrides(): VoiceOverride[] {
    return [
      { 
        "ref":"meadow_tales_beg_v1", 
        "id":"meadow_tales_easy_v1",
        "vf":{"cad":10}, 
        "uig":{"rules":{"u":{"m":"subtle","max":4},"c":{"m":"subtle","max":3},"a":{"m":"subtle","max":2},"f":{"m":"subtle","max":1},"h":{"m":"subtle","max":1}}} 
      },
      { 
        "ref":"goodnight_whisper_beg_v1", 
        "id":"goodnight_whisper_easy_v1",
        "vf":{"cad":9}, 
        "uig":{"rules":{"u":{"m":"subtle","max":4},"c":{"m":"subtle","max":2},"a":{"m":"subtle","max":1},"f":{"m":"subtle","max":0},"h":{"m":"subtle","max":0}}} 
      },
      { 
        "ref":"bear_and_bee_beg_v1", 
        "id":"bear_and_bee_easy_v1",
        "vf":{"cad":11}, 
        "uig":{"rules":{"u":{"m":"subtle","max":3},"c":{"m":"subtle","max":2},"a":{"m":"subtle","max":2},"f":{"m":"subtle","max":1},"h":{"m":"subtle","max":1}}} 
      }
    ];
  }

  /**
   * Load medium voices (your level 2 data)
   */
  static loadMediumVoices(): VoiceDefinition[] {
    return [
      {
        "id":"neighborhood_realist_med_v1",
        "pn":"Neighborhood Realist",
        "vf":{"tone":[4,5],"cad":12,"var":4,"wp":[0,3],"fig":0.35,"hum":0.5,"warm":0.9,"nar":2},
        "st":{"hk":[2],"tr":[6,2],"pz":[3],"ct":[5],"tw":[8],"en":[6]},
        "ch":{"hp":[8,4],"pov":"third","dlg":[4,1],"arc":[3,11]},
        "wd":{"set":[18,4,5],"sc":"everyday","mor":"implied","lp":[],"rp":[9]},
        "rd":{"rh":"none","aa":1,"ono":[16],"sl":1},
        "eg":{"dir":0,"lst":1,"ip":["what_would_you_do"],"contr":0,"exag":0},
        "th":["friendship","school day","small wins"],
        "tg":[6,15],
        "uig":{
          "aff":{"u":0.8,"c":0.4,"a":0.3,"f":0.3,"h":0.5},
          "rules":{
            "u":{"m":"subtle","max":2},
            "c":{"m":"subtle","max":2},
            "a":{"m":"subtle","max":1},
            "f":{"m":"subtle","max":1},
            "h":{"m":"subtle","max":1}
          }
        },
        "src":["Beverly Cleary"]
      }
    ];
  }

  /**
   * Load hard voices (your level 3 data)
   */
  static loadHardVoices(): VoiceDefinition[] {
    return [
      {
        "id":"doorway_chronicler_hard_v1",
        "pn":"Doorway Chronicler",
        "vf":{"tone":[9,4],"cad":13,"var":3,"wp":[0],"fig":0.6,"hum":0.3,"warm":0.75,"nar":2},
        "st":{"hk":[12],"tr":[4,10],"pz":[0,5],"ct":[4],"tw":[1,10,11],"en":[8,9]},
        "ch":{"hp":[12,0],"pov":"third","dlg":[5,9],"arc":[11,10]},
        "wd":{"set":[6,21,8],"sc":"grand","mor":"symbolic","lp":["portal"],"rp":["three_trials"]},
        "rd":{"rh":"none","aa":1,"ono":["thrum"],"sl":1},
        "eg":{"dir":0,"lst":0,"ip":[],"contr":0,"exag":0},
        "th":["portal_fantasy","choice","friendship"],
        "tg":[16,26,27],
        "uig":{
          "aff":{"u":0.6,"c":0.3,"a":0.3,"f":0.2,"h":0.3},
          "rules":{
            "u":{"m":"subtle","max":1},
            "c":{"m":"subtle","max":2}, 
            "a":{"m":"subtle","max":1},
            "f":{"m":"subtle","max":1},
            "h":{"m":"subtle","max":1}
          }
        },
        "src":["C. S. Lewis"]
      }
    ];
  }

  /**
   * Load expert voices (your level 4 data)
   */
  static loadExpertVoices(): VoiceDefinition[] {
    return [
      {
        "id":"academy_hidden_doors_exp_v1",
        "pn":"Academy of Hidden Doors",
        "vf":{"tone":[18,9],"cad":14,"var":4,"wp":[0,3],"fig":0.55,"hum":0.5,"warm":0.8,"nar":2},
        "st":{"hk":[14],"tr":[10],"pz":[5],"ct":[4],"tw":[1,12,10,11],"en":[9]},
        "ch":{"hp":[11,12,10],"pov":"third","dlg":[8,4],"arc":[9,11]},
        "wd":{"set":[14,21,23],"sc":"grand","mor":"implied","lp":["legend_bleeds_present"],"rp":["three_trials","series_button"]},
        "rd":{"rh":"none","aa":0,"ono":["whoosh","clang"],"sl":1},
        "eg":{"dir":0,"lst":0,"ip":["solve_with_team"],"contr":0,"exag":0},
        "th":["magic_school","found_family","responsibility"],
        "tg":[31,28,29],
        "uig":{
          "aff":{"u":0.5,"c":0.3,"a":0.3,"f":0.2,"h":0.4},
          "rules":{
            "u":{"m":"subtle","max":1},
            "c":{"m":"subtle","max":1},
            "a":{"m":"subtle","max":1},
            "f":{"m":"subtle","max":1},
            "h":{"m":"subtle","max":1}
          }
        },
        "src":["J. K. Rowling"]
      }
    ];
  }
}