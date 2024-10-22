type BandData = {
  name: string;
  location: string;
  rehearsals: {
    start: Date;
    end: Date;
    title: string;
    _id?: any;
  }[];
  studioId: string;
  createdBy: string;
  _id?: any;
};

export const dataMapper = (data: BandData): BandData => {
  return {
    _id: data._id?.toString(),
    name: data.name,
    location: data.location,
    rehearsals: data.rehearsals.map((rehearsal) => ({
      _id: rehearsal._id?.toString(),
      start: rehearsal.start,
      end: rehearsal.end,
      title: rehearsal.title,
    })),
    studioId: data.studioId.toString(),
    createdBy: data.createdBy,
  };
};
