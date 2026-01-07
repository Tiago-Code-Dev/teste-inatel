import { useState, createContext, useContext, ReactNode } from 'react';
import { CommandPalette } from './CommandPalette';

interface GlobalContextValue {
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
}

const GlobalContext = createContext<GlobalContextValue | null>(null);

export function useGlobalContext() {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalContext must be used within GlobalProviders');
  }
  return context;
}

interface GlobalProvidersProps {
  children: ReactNode;
}

export function GlobalProviders({ children }: GlobalProvidersProps) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  return (
    <GlobalContext.Provider value={{ commandPaletteOpen, setCommandPaletteOpen }}>
      {children}
      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
    </GlobalContext.Provider>
  );
}
