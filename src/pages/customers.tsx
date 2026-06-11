import React, { useState, useEffect } from "react";
import { GlobalErrorBoundary } from "@/components/error-boundary/global-error-boundary";
import { 
  User, 
  Search, 
  Plus,
  Filter,
  Users,
  Trash2,
  Edit2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Customer360 } from "@/components/customer-360/customer-view";
import { useContacts } from "@/hooks/crm/use-contacts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ContactForm } from "@/components/customer-360/contact-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function Customer360View() {
  const { contacts, isLoading, createContact, updateContact, deleteContact } = useContacts();
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    if (contacts && contacts.length > 0 && !selectedContactId) {
      setSelectedContactId(contacts[0].id);
    }
  }, [contacts, selectedContactId]);

  const filteredContacts = contacts?.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  );

  const selectedContact = contacts?.find(c => c.id === selectedContactId);

  return (
    <GlobalErrorBoundary name="Customer360View">
      <div className="flex h-full bg-[#020817] overflow-hidden">
        {/* Sidebar: Lista de Contatos */}
        <aside className="w-[380px] border-r border-white/5 bg-[#030712]/40 flex flex-col shrink-0">
          <div className="p-6 border-b border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">Contatos</h2>
              </div>
              
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                    <Plus className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#020817] border-white/10 text-white max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-black uppercase tracking-tight italic">Novo Contato</DialogTitle>
                  </DialogHeader>
                  <ContactForm 
                    onSubmit={async (data) => {
                      await createContact(data);
                      setIsCreateOpen(false);
                    }} 
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <Input 
                placeholder="Pesquisar por nome, email ou tel..." 
                className="bg-white/[0.03] border-white/10 pl-10 h-11 text-sm rounded-xl text-white placeholder:text-slate-600 focus:ring-indigo-500/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {isLoading ? (
                <div className="p-8 text-center text-slate-500 text-xs font-bold uppercase animate-pulse">Carregando contatos...</div>
              ) : filteredContacts?.length === 0 ? (
                <div className="p-8 text-center text-slate-600 text-xs font-bold uppercase">Nenhum contato encontrado</div>
              ) : (
                filteredContacts?.map((contact) => (
                  <div 
                    key={contact.id}
                    onClick={() => setSelectedContactId(contact.id)}
                    className={cn(
                      "p-3 rounded-xl cursor-pointer transition-all group relative border border-transparent",
                      selectedContactId === contact.id 
                        ? "bg-indigo-600/10 border-indigo-500/20 shadow-[inset_0_0_20px_rgba(79,70,229,0.05)]" 
                        : "hover:bg-white/[0.02]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-white/5 group-hover:border-indigo-500/30 transition-all">
                        <AvatarFallback className="bg-slate-800 text-slate-400 font-bold text-xs">
                          {contact.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm font-bold truncate transition-colors",
                          selectedContactId === contact.id ? "text-white" : "text-slate-300 group-hover:text-white"
                        )}>
                          {contact.name || "Sem Nome"}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate font-medium">
                          {contact.email || contact.phone || "Sem contato"}
                        </p>
                      </div>
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        contact.lead_score >= 80 ? "bg-emerald-500" : (contact.lead_score >= 40 ? "bg-amber-500" : "bg-slate-700")
                      )} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </aside>

        {/* Main Content: Customer 360 View */}
        <main className="flex-1 flex flex-col h-full relative">
          <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#020817]/50 backdrop-blur-xl shrink-0 z-10">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-black text-white tracking-tight uppercase italic">
                {selectedContact?.name || "Customer 360"}
              </h1>
              {selectedContact && (
                <div className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest border border-indigo-500/20">
                  {selectedContact.lifecycle_stage}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {selectedContact && (
                <>
                  <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="rounded-xl border-white/10 text-white hover:bg-white/5 font-bold uppercase text-[10px] tracking-widest h-10 px-6 transition-all active:scale-95">
                        <Edit2 className="w-3.5 h-3.5 mr-2" />
                        Editar
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#020817] border-white/10 text-white max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tight italic">Editar Contato</DialogTitle>
                      </DialogHeader>
                      <ContactForm 
                        initialData={selectedContact}
                        onSubmit={async (data) => {
                          await updateContact({ id: selectedContact.id, ...data });
                          setIsEditOpen(false);
                        }} 
                      />
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" className="h-10 w-10 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-[#0f172a] border-white/10 text-slate-200">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                          Esta ação não pode ser desfeita. Isso excluirá permanentemente o contato
                          e removerá os dados de nossos servidores.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deleteContact(selectedContact.id)}
                          className="bg-rose-600 hover:bg-rose-500 text-white"
                        >
                          Excluir Contato
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </header>

          <ScrollArea className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              {selectedContactId ? (
                <Customer360 contactId={selectedContactId} />
              ) : (
                <div className="flex flex-col items-center justify-center h-[60vh] text-slate-600">
                  <User className="w-20 h-20 opacity-5 mb-4" />
                  <p className="text-sm font-bold uppercase tracking-[0.2em] opacity-40">Selecione um cliente para visualizar</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </main>
      </div>
    </GlobalErrorBoundary>
  );
}
