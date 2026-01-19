import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, CreditCard, Plus, ArrowUpRight, ArrowDownLeft, Crown, Euro } from "lucide-react";

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
          
          <Button 
            onClick={onAddFunds}
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter des fonds
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="font-medium text-sm">Recevoir</p>
              <p className="text-xs text-muted-foreground">Commissions</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Retirer</p>
              <p className="text-xs text-muted-foreground">Vers banque</p>
            </div>
          </CardContent>
        </Card>
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
