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
import { Wallet, CreditCard, ArrowUpRight, ArrowDownLeft, Crown, Euro, Building2, CheckCircle2, Loader2, AlertCircle, Copy } from "lucide-react";
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
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [iban, setIban] = useState("");
  const [bic, setBic] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock IBAN for deposits
  const findrIban = "FR76 1234 5678 9012 3456 7890 123";
  const findrBic = "FINDRFRPP";

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast({
        title: "Montant invalide",
        description: "Veuillez entrer un montant valide.",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(withdrawAmount) > balance) {
      toast({
        title: "Solde insuffisant",
        description: "Vous n'avez pas assez de fonds pour ce retrait.",
        variant: "destructive",
      });
      return;
    }

    if (!iban || !bic) {
      toast({
        title: "Informations bancaires requises",
        description: "Veuillez entrer votre IBAN et BIC.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Virement initié ! 🏦",
      description: `${parseFloat(withdrawAmount).toFixed(2)}€ seront transférés sous 2-3 jours ouvrés.`,
    });
    
    setIsProcessing(false);
    setWithdrawOpen(false);
    setWithdrawAmount("");
    setIban("");
    setBic("");
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast({
        title: "Montant invalide",
        description: "Veuillez entrer un montant valide.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Instructions envoyées ! 📧",
      description: "Effectuez le virement avec les coordonnées ci-dessus.",
    });
    
    setIsProcessing(false);
    setDepositOpen(false);
    setDepositAmount("");
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ""));
    toast({
      title: "Copié !",
      description: `${label} copié dans le presse-papier.`,
    });
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
              <CardTitle className="text-lg">Portefeuille Findr</CardTitle>
            </div>
            {isPremium && (
              <Badge className="bg-accent text-accent-foreground">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
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
          
          {!isPremium && (
            <div className="bg-primary-foreground/10 rounded-lg p-3 mb-4">
              <p className="text-sm flex items-center gap-2">
                <Crown className="w-4 h-4 text-accent" />
                <span>Passez <span className="font-semibold text-accent">Premium</span> pour 0% de commission !</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions - Bank Transfers */}
      <div className="grid grid-cols-2 gap-4">
        {/* Deposit from Bank */}
        <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
          <DialogTrigger asChild>
            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center group-hover:bg-success/20 transition-colors">
                  <ArrowDownLeft className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="font-medium text-sm">Déposer</p>
                  <p className="text-xs text-muted-foreground">Depuis ma banque</p>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-success" />
                Déposer des fonds
              </DialogTitle>
              <DialogDescription>
                Effectuez un virement bancaire vers votre portefeuille Findr
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="depositAmount">Montant à déposer</Label>
                <div className="relative">
                  <Input
                    id="depositAmount"
                    type="number"
                    placeholder="100.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="pr-8"
                    min="1"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                </div>
              </div>

              {/* Bank Details */}
              <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium text-primary">Coordonnées bancaires Findr</p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-background rounded-md p-2">
                    <div>
                      <p className="text-xs text-muted-foreground">IBAN</p>
                      <p className="font-mono text-sm">{findrIban}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => copyToClipboard(findrIban, "IBAN")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between bg-background rounded-md p-2">
                    <div>
                      <p className="text-xs text-muted-foreground">BIC</p>
                      <p className="font-mono text-sm">{findrBic}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => copyToClipboard(findrBic, "BIC")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Indiquez votre email Findr en référence du virement pour un crédit rapide.</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>Crédit sous 1-2 jours ouvrés</span>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setDepositOpen(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleDeposit}
                disabled={isProcessing || !depositAmount}
                className="bg-success hover:bg-success/90 text-success-foreground"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    J'ai effectué le virement
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Withdraw to Bank */}
        <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
          <DialogTrigger asChild>
            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <ArrowUpRight className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Retirer</p>
                  <p className="text-xs text-muted-foreground">Vers ma banque</p>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Retirer des fonds
              </DialogTitle>
              <DialogDescription>
                Transférez vos gains vers votre compte bancaire
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
                <Label htmlFor="withdrawAmount">Montant à retirer</Label>
                <div className="relative">
                  <Input
                    id="withdrawAmount"
                    type="number"
                    placeholder="50.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
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
                  onClick={() => setWithdrawAmount(balance.toString())}
                >
                  Retirer tout
                </Button>
              </div>

              {/* IBAN */}
              <div className="space-y-2">
                <Label htmlFor="iban">IBAN</Label>
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
              <Button variant="outline" onClick={() => setWithdrawOpen(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleWithdraw}
                disabled={isProcessing || !withdrawAmount || !iban || !bic}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Retirer {withdrawAmount ? `${parseFloat(withdrawAmount).toFixed(2)} €` : ""}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

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