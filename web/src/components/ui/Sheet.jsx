import { useState, createContext, useContext } from 'react';

const SheetContext = createContext();

const Sheet = ({ children }) => {
  const [open, setOpen] = useState(false);
  
  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  );
};

const SheetTrigger = ({ asChild, children, ...props }) => {
  const { setOpen } = useContext(SheetContext);
  
  if (asChild) {
    // Clone the child element and add the onClick handler
    const child = children;
    return {
      ...child,
      props: {
        ...child.props,
        onClick: () => setOpen(true),
        ...props
      }
    };
  }
  
  return (
    <button onClick={() => setOpen(true)} {...props}>
      {children}
    </button>
  );
};

const SheetContent = ({ side = 'right', className = '', children, ...props }) => {
  const { open, setOpen } = useContext(SheetContext);
  
  if (!open) return null;
  
  const sideClasses = {
    left: 'left-0',
    right: 'right-0',
    top: 'top-0',
    bottom: 'bottom-0'
  };
  
  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      
      {/* Sheet */}
      <div
        className={`fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out ${sideClasses[side]} ${
          side === 'left' || side === 'right' ? 'h-full w-3/4 sm:max-w-sm' : 'w-full'
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    </>
  );
};

export { Sheet, SheetTrigger, SheetContent }; 