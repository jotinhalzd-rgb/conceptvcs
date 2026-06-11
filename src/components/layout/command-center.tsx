import React, { useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useUIStore } from "@/hooks/core/use-ui-store";
import { useQuickLaunch } from "@/hooks/core/use-quick-launch";
import { 
  Search, 
  History, 
  Zap, 
  Star, 
  Loader2,
  Users,
  MessageSquare,
  Briefcase,
  Ticket,
  LayoutDashboard,
  Settings,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export function CommandCenter() {
  const { quickLaunchOpen: open, setQuickLaunchOpen: setOpen } = useUIStore();
  const { 
    query, 
    setQuery, 
    results, 
    isLoading, 
    quickActions, 
    navigationCommands,
    recentActions 
  } = useQuickLaunch();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpen]);

  const handleAction = (action: () => void) => {
    action();
    setOpen(false);
  };

  return (
    <CommandDialog 
      open={open} 
      onOpenChange={setOpen}
    >
      <div className="bg-[#030712] border-b border-white/5">
        <CommandInput 
          placeholder="O que você deseja fazer hoje? (Pesquise clientes, ações, comandos...)" 
          value={query}
          onValueChange={setQuery}
          className="h-16 text-lg border-none focus:ring-0 bg-transparent text-white placeholder:text-slate-500"
        />
      </div>
      
      <CommandList className="max-h-[500px] bg-[#020617] p-2 no-scrollbar">
        {isLoading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          </div>
        )}

        <CommandEmpty className="py-10 text-center">
          <div className="flex flex-col items-center gap-3">
            <Search className="h-10 w-10 text-slate-700" />
            <p className="text-slate-400 font-medium">Nenhum resultado encontrado para "{query}"</p>
            <p className="text-xs text-slate-600">Tente pesquisar por clientes, comandos ou navegação.</p>
          </div>
        </CommandEmpty>

        {query.length === 0 && (
          <>
            {recentActions.length > 0 && (
              <CommandGroup heading={<span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase flex items-center gap-2 px-2"><History className="h-3 w-3" /> Recentes</span>}>
                {recentActions.map((action) => (
                  <CommandItem 
                    key={action.id}
                    onSelect={() => handleAction(() => {})} // Ação real seria redirecionar baseada no tipo
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center group-hover:bg-indigo-500/20 transition-all">
                      {action.icon === "Users" && <Users className="h-4 w-4 text-slate-400 group-hover:text-indigo-400" />}
                      {action.icon === "MessageSquare" && <MessageSquare className="h-4 w-4 text-slate-400 group-hover:text-indigo-400" />}
                      {action.icon === "Briefcase" && <Briefcase className="h-4 w-4 text-slate-400 group-hover:text-indigo-400" />}
                    </div>
                    <span className="text-sm font-medium text-slate-300 group-hover:text-white">{action.title}</span>
                    <ChevronRight className="h-4 w-4 ml-auto text-slate-700 opacity-0 group-hover:opacity-100 transition-all" />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            <CommandGroup heading={<span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase flex items-center gap-2 px-2"><Star className="h-3 w-3" /> Favoritos & Navegação</span>}>
              {navigationCommands.map((cmd) => (
                <CommandItem 
                  key={cmd.title}
                  onSelect={() => handleAction(cmd.action)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-all">
                    <cmd.icon className="h-4 w-4 text-indigo-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-300 group-hover:text-white">{cmd.title}</span>
                  <div className="ml-auto flex items-center gap-2">
                     <span className="text-[10px] bg-white/[0.03] px-2 py-0.5 rounded text-slate-500 font-mono">Abrir</span>
                     <ChevronRight className="h-4 w-4 text-slate-700 opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {results.map((category) => (
          <CommandGroup 
            key={category.category} 
            heading={<span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase flex items-center gap-2 px-2">{category.category}</span>}
          >
            {category.items.map((item: any) => (
              <CommandItem 
                key={item.id}
                onSelect={() => handleAction(item.action)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-lg bg-white/[0.02] flex items-center justify-center border border-white/[0.05] group-hover:border-indigo-500/30 group-hover:bg-indigo-500/10 transition-all">
                  <item.icon className="h-5 w-5 text-slate-400 group-hover:text-indigo-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white leading-none mb-1">{item.title}</span>
                  <span className="text-xs text-slate-500">{item.subtitle}</span>
                </div>
                <ChevronRight className="h-4 w-4 ml-auto text-slate-700 opacity-0 group-hover:opacity-100 transition-all" />
              </CommandItem>
            ))}
          </CommandGroup>
        ))}

        {!query && quickActions.map((group) => (
          <CommandGroup 
            key={group.category} 
            heading={<span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase flex items-center gap-2 px-2">{group.category}</span>}
          >
            {group.items.map((item) => (
              <CommandItem 
                key={item.id}
                onSelect={() => handleAction(item.action)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/[0.02] flex items-center justify-center border border-white/[0.05] group-hover:bg-emerald-500/10 transition-all">
                  <item.icon className="h-4 w-4 text-slate-400 group-hover:text-emerald-400" />
                </div>
                <span className="text-sm font-medium text-slate-300 group-hover:text-white">{item.title}</span>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-[10px] bg-white/[0.03] px-2 py-0.5 rounded text-slate-500 font-mono">Ação Rápida</span>
                  <ChevronRight className="h-4 w-4 text-slate-700 opacity-0 group-hover:opacity-100 transition-all" />
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
      
      <div className="p-3 border-t border-white/5 bg-[#030712] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/10 font-mono">↑↓</kbd>
            Navegar
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/10 font-mono">Enter</kbd>
            Selecionar
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/10 font-mono">Esc</kbd>
            Fechar
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-indigo-400 font-bold uppercase tracking-widest">
          <Zap className="h-3 w-3 fill-indigo-400" />
          ONECONTACT Command Center
        </div>
      </div>
    </CommandDialog>
  );
}
