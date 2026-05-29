type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export function PageContainer({ children, className = "" }: PageContainerProps) {
  return (
    <div
      className={`mx-auto w-full max-w-[1200px] px-6 md:px-10 lg:px-16 ${className}`.trim()}
    >
      {children}
    </div>
  );
}
