interface PageContainerProps {
  children: React.ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-4rem)] pb-20 md:pb-8">
      <div className="container px-4 py-6 md:max-w-2xl lg:max-w-2xl xl:max-w-2xl mx-auto">
        {children}
      </div>
    </div>
  );
}
