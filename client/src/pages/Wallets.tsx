import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, Plus, Trash2, ExternalLink } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

const NETWORK_EXPLORERS: Record<string, string> = {
  ethereum: "https://etherscan.io/address/",
  bsc: "https://bscscan.com/address/",
  polygon: "https://polygonscan.com/address/",
  arbitrum: "https://arbiscan.io/address/",
  tron: "https://tronscan.org/#/address/",
};

const NETWORK_NAMES: Record<string, string> = {
  ethereum: "以太坊 (Ethereum)",
  bsc: "幣安智能鏈 (BSC)",
  polygon: "Polygon",
  arbitrum: "Arbitrum",
  tron: "TRON",
};

export default function Wallets() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Form state
  const [network, setNetwork] = useState<"ethereum" | "bsc" | "polygon" | "arbitrum" | "tron">("ethereum");
  const [address, setAddress] = useState("");
  const [label, setLabel] = useState("");

  // Queries and mutations
  const { data: wallets = [], refetch } = trpc.wallets.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const addMutation = trpc.wallets.add.useMutation({
    onSuccess: () => {
      toast.success("錢包已成功新增！");
      setIsOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "新增失敗");
    },
  });

  const deleteMutation = trpc.wallets.delete.useMutation({
    onSuccess: () => {
      toast.success("錢包已刪除");
      setDeleteId(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "刪除失敗");
    },
  });

  const resetForm = () => {
    setNetwork("ethereum");
    setAddress("");
    setLabel("");
  };

  const handleAdd = async () => {
    if (!address) {
      toast.error("請填入錢包地址");
      return;
    }

    // Basic address validation
    if (address.length < 20) {
      toast.error("錢包地址格式不正確");
      return;
    }

    addMutation.mutate({
      network,
      address,
      label: label || undefined,
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">錢包地址管理</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add New Wallet */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>追蹤新錢包</CardTitle>
            <CardDescription>
              輸入您的公開錢包地址。我們只需要公開地址，不需要私鑰。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  新增錢包
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>追蹤錢包地址</DialogTitle>
                  <DialogDescription>
                    輸入您的公開錢包地址以追蹤其資產。
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Network Selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      選擇區塊鏈網路
                    </label>
                    <Select value={network} onValueChange={(v: any) => setNetwork(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ethereum">以太坊 (Ethereum)</SelectItem>
                        <SelectItem value="bsc">幣安智能鏈 (BSC)</SelectItem>
                        <SelectItem value="polygon">Polygon</SelectItem>
                        <SelectItem value="arbitrum">Arbitrum</SelectItem>
                        <SelectItem value="tron">TRON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Address Input */}
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      錢包地址
                    </label>
                    <Input
                      placeholder="輸入您的公開錢包地址"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>

                  {/* Label */}
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      標籤（可選）
                    </label>
                    <Input
                      placeholder="例如：主錢包、冷錢包"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={handleAdd}
                    disabled={addMutation.isPending}
                    className="w-full"
                  >
                    {addMutation.isPending ? "新增中..." : "新增"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Wallets List */}
        <Card>
          <CardHeader>
            <CardTitle>已追蹤的錢包</CardTitle>
            <CardDescription>
              {wallets.length === 0
                ? "您還沒有追蹤任何錢包"
                : `共 ${wallets.length} 個錢包已追蹤`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {wallets.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600 mb-4">尚未追蹤任何錢包</p>
              </div>
            ) : (
              <div className="space-y-3">
                {wallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900">
                        {NETWORK_NAMES[wallet.network]}
                        {wallet.label && ` • ${wallet.label}`}
                      </div>
                      <div className="text-sm text-slate-600 mt-1 break-all font-mono">
                        {wallet.address}
                      </div>
                      <div className="text-sm text-slate-600 mt-1">
                        {wallet.lastSyncedAt
                          ? `最後同步：${new Date(wallet.lastSyncedAt).toLocaleString("zh-TW")}`
                          : "尚未同步"}
                      </div>
                      {wallet.lastSyncError && (
                        <div className="text-sm text-red-600 mt-1">
                          錯誤：{wallet.lastSyncError}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const explorer = NETWORK_EXPLORERS[wallet.network];
                          if (explorer) {
                            window.open(explorer + wallet.address, "_blank");
                          }
                        }}
                      >
                        <ExternalLink className="w-4 h-4 text-blue-600" />
                      </Button>
                      <AlertDialog open={deleteId === wallet.id} onOpenChange={(open) => !open && setDeleteId(null)}>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(wallet.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>刪除錢包</AlertDialogTitle>
                            <AlertDialogDescription>
                              確定要刪除這個錢包嗎？此操作無法撤銷。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="flex gap-3">
                            <AlertDialogCancel>取消</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                deleteMutation.mutate({ id: wallet.id });
                              }}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              刪除
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">ℹ️ 錢包追蹤說明</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 space-y-2">
            <p>✓ 我們只需要您的公開錢包地址，不需要私鑰或助記詞</p>
            <p>✓ 錢包數據透過區塊鏈瀏覽器 API 自動更新</p>
            <p>✓ 您可以追蹤多個區塊鏈上的錢包</p>
            <p>✓ 點擊「外部連結」圖示可在區塊鏈瀏覽器上查看詳細資訊</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
