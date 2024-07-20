export const ErrorWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="absolute top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%]">
      {children}
    </div>
  );
};
