import { BandZodType } from '@/types/band';

export const useBand = () => {
  const getBandNames = (bands: BandZodType[], studioId: string) => {
    return bands
      .filter((band) => {
        return band.studioId === studioId;
      })
      .map((band) => {
        return band.name;
      });
  };

  const getRehearsals = (bands: BandZodType[], studioId: string) => {
    return bands
      .filter((band) => {
        return band.studioId === studioId;
      })
      .flatMap((band) => {
        return band.rehearsals.map((rehearsal) => ({
          ...rehearsal,
          name: band.name,
        }));
      });
  };

  return {
    getBandNames,
    getRehearsals,
  };
};
