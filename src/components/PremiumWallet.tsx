import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Wallet, CreditCard, ArrowUpRight, ArrowDownLeft, Euro, Building2, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  date: string;
}

interface PremiumWalletProps {
  balance: number;
  isPremium: boolean;
  transactions: Transaction[];
  onAddFunds: () => void;
}

const PremiumWallet = ({ balance, isPremium, transactions, onAddFunds }: PremiumWalletProps) => {
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [iban, setIban] = useState("");
  const [bic, setBic] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTransfer = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast({
        title: "Montant invalide",
        description: "Veuillez entrer un montant valide.",
        variant: "destructive",
      });
      return;
    }

    if (!iban || !bic) {
      toast({
        title: "Informations bancaires requises",
        description: "Veuillez entrer l'IBAN et le BIC du destinataire.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Virement initié ! 🏦",
      description: `${parseFloat(depositAmount).toFixed(2)}€ seront transférés sous 2-3 jours ouvrés.`,
    });
    
    setIsProcessing(false);
    setDepositOpen(false);
    setDepositAmount("");
    setIban("");
    setBic("");
  };

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-foreground/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              <CardTitle className="text-lg">Portefeuille findr</CardTitle>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="relative">
          <div className="mb-6">
            <p className="text-sm opacity-80 mb-1">Solde disponible</p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">{balance.toFixed(2)}</span>
              <Euro className="w-6 h-6" />
            </div>
          </div>
        </CardContent>

      </Card>

      {/* Info - Mixed Payment */}
      <Card className="border-dashed border-primary/30 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-primary mb-1">Paiement mixte automatique</p>
              <p className="text-muted-foreground">
                Si votre solde est insuffisant lors d'une transaction, le reste sera automatiquement débité de votre compte bancaire enregistré.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Action - Bank Transfer */}
      <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
        <DialogTrigger asChild>
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <ArrowUpRight className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Transférer vers un compte bancaire</p>
                <p className="text-xs text-muted-foreground">Retirer vos fonds</p>
              </div>
            </CardContent>
          </Card>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Transférer vers un compte bancaire
            </DialogTitle>
            <DialogDescription>
              Transférez vos fonds vers votre compte bancaire
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Current Balance */}
            <div className="bg-secondary/50 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">Solde disponible</p>
              <p className="text-2xl font-bold text-primary">{balance.toFixed(2)} €</p>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="depositAmount">Montant à transférer</Label>
              <div className="relative">
                <Input
                  id="depositAmount"
                  type="number"
                  placeholder="50.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="pr-8"
                  min="1"
                  max={balance}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="text-xs"
                onClick={() => setDepositAmount(balance.toString())}
              >
                Transférer tout le solde
              </Button>
            </div>

            {/* IBAN */}
            <div className="space-y-2">
              <Label htmlFor="iban">IBAN du destinataire</Label>
              <Input
                id="iban"
                placeholder="FR76 1234 5678 9012 3456 7890 123"
                value={iban}
                onChange={(e) => setIban(e.target.value)}
                className="font-mono"
              />
            </div>

            {/* BIC */}
            <div className="space-y-2">
              <Label htmlFor="bic">BIC / SWIFT</Label>
              <Input
                id="bic"
                placeholder="BNPAFRPP"
                value={bic}
                onChange={(e) => setBic(e.target.value)}
                className="font-mono"
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span>Virement sous 2-3 jours ouvrés</span>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDepositOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleTransfer}
              disabled={isProcessing || !depositAmount || !iban || !bic || parseFloat(depositAmount) > balance}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Transférer {depositAmount ? `${parseFloat(depositAmount).toFixed(2)} €` : ""}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transactions récentes</CardTitle>
          <CardDescription>Historique de vos mouvements</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">Aucune transaction pour le moment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      transaction.type === "credit" ? "bg-success/10" : "bg-destructive/10"
                    }`}>
                      {transaction.type === "credit" ? (
                        <ArrowDownLeft className="w-4 h-4 text-success" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">{transaction.date}</p>
                    </div>
                  </div>
                  <span className={`font-semibold ${
                    transaction.type === "credit" ? "text-success" : "text-destructive"
                  }`}>
                    {transaction.type === "credit" ? "+" : "-"}{transaction.amount.toFixed(2)} €
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PremiumWallet;
