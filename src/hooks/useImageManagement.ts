import { useState, useCallback } from 'react';

export interface ImageManagementState {
  pageImages: Record<number, string>;
  pageImageMetadata: Record<number, any>;
  isGeneratingImage: boolean;
  isPreparingImage: boolean;
  imageLoadingStates: Record<number, boolean>;
  fallbackStates: Record<number, boolean>;
  isBatchGenerating: boolean;
  batchDone: number;
  batchTotal: number;
  imageAspectRatios: Record<number, number>;
  imageNaturalSizes: Record<number, {width: number, height: number}>;
}

export interface ImageManagementActions {
  setPageImages: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  setPageImageMetadata: React.Dispatch<React.SetStateAction<Record<number, any>>>;
  setIsGeneratingImage: React.Dispatch<React.SetStateAction<boolean>>;
  setIsPreparingImage: React.Dispatch<React.SetStateAction<boolean>>;
  setImageLoadingStates: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
  setFallbackStates: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
  setIsBatchGenerating: React.Dispatch<React.SetStateAction<boolean>>;
  setBatchDone: React.Dispatch<React.SetStateAction<number>>;
  setBatchTotal: React.Dispatch<React.SetStateAction<number>>;
  setImageAspectRatios: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  setImageNaturalSizes: React.Dispatch<React.SetStateAction<Record<number, {width: number, height: number}>>>;
  clearAllImages: () => void;
  clearPageImage: (pageNumber: number) => void;
  updateImageMetadata: (pageNumber: number, metadata: any) => void;
}

export const useImageManagement = () => {
  const [pageImages, setPageImages] = useState<Record<number, string>>({});
  const [pageImageMetadata, setPageImageMetadata] = useState<Record<number, any>>({});
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isPreparingImage, setIsPreparingImage] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<number, boolean>>({});
  const [fallbackStates, setFallbackStates] = useState<Record<number, boolean>>({});
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [batchDone, setBatchDone] = useState(0);
  const [batchTotal, setBatchTotal] = useState(0);
  const [imageAspectRatios, setImageAspectRatios] = useState<Record<number, number>>({});
  const [imageNaturalSizes, setImageNaturalSizes] = useState<Record<number, {width: number, height: number}>>({});

  const clearAllImages = useCallback(() => {
    setPageImages({});
    setPageImageMetadata({});
    setImageLoadingStates({});
    setFallbackStates({});
    setImageAspectRatios({});
    setImageNaturalSizes({});
    setBatchDone(0);
    setBatchTotal(0);
    setIsGeneratingImage(false);
    setIsPreparingImage(false);
    setIsBatchGenerating(false);
  }, []);

  const clearPageImage = useCallback((pageNumber: number) => {
    setPageImages(prev => {
      const newImages = { ...prev };
      delete newImages[pageNumber];
      return newImages;
    });
    setPageImageMetadata(prev => {
      const newMetadata = { ...prev };
      delete newMetadata[pageNumber];
      return newMetadata;
    });
    setImageLoadingStates(prev => {
      const newStates = { ...prev };
      delete newStates[pageNumber];
      return newStates;
    });
    setFallbackStates(prev => {
      const newStates = { ...prev };
      delete newStates[pageNumber];
      return newStates;
    });
  }, []);

  const updateImageMetadata = useCallback((pageNumber: number, metadata: any) => {
    setPageImageMetadata(prev => ({
      ...prev,
      [pageNumber]: { ...prev[pageNumber], ...metadata }
    }));
  }, []);

  const state: ImageManagementState = {
    pageImages,
    pageImageMetadata,
    isGeneratingImage,
    isPreparingImage,
    imageLoadingStates,
    fallbackStates,
    isBatchGenerating,
    batchDone,
    batchTotal,
    imageAspectRatios,
    imageNaturalSizes,
  };

  const actions: ImageManagementActions = {
    setPageImages,
    setPageImageMetadata,
    setIsGeneratingImage,
    setIsPreparingImage,
    setImageLoadingStates,
    setFallbackStates,
    setIsBatchGenerating,
    setBatchDone,
    setBatchTotal,
    setImageAspectRatios,
    setImageNaturalSizes,
    clearAllImages,
    clearPageImage,
    updateImageMetadata,
  };

  return { state, actions };
};