import { SubNavbar } from './SubNavbar';

export const StudioNavbar = ({
  id,
  studioName,
}: {
  id: string;
  studioName?: string;
}) => {
  return (
    <div className="border-t-[1px] flex justify-between items-center w-full bg-white pr-12 border-b-[1px] sticky top-[68px] z-50">
      <SubNavbar id={id} studioName={studioName} />
      {/* TODO: for v2 introduce a popover by clicking on a studio name, should have settings and check out other studios links */}
      <div className="flex items-center gap-2">
        <p>Studio: </p>
        <div className="p-2 bg-gray-100 font-medium rounded-md">
          {studioName}
        </div>
      </div>
    </div>
  );
};
