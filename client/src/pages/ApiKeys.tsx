import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, Plus, Trash2, Copy, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function ApiKeys() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Form state
  const [exchange, setExchange] = useState<"binance" | "okx">("binance");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [label, setLabel] = useState("");

  // Queries and mutations
  const { data: apiKeys = [], refetch } = trpc.apiKeys.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const addMutation = trpc.apiKeys.add.useMutation({
    onSuccess: () => {
      toast.success("交易所已成功連接！");
      setIsOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "連接失敗，請檢查您的 API 憑證");
    },
  });

  const deleteMutation = trpc.apiKeys.delete.useMutation({
    onSuccess: () => {
      toast.success("API Key 已刪除");
      setDeleteId(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "刪除失敗");
    },
  });

  const resetForm = () => {
    setExchange("binance");
    setApiKey("");
    setApiSecret("");
    setPassphrase("");
    setLabel("");
  };

  const handleAdd = async () => {
    if (!apiKey || !apiSecret) {
      toast.error("請填入 API Key 和 API Secret");
      return;
    }

    addMutation.mutate({
      exchange,
      apiKey,
      apiSecret,
      passphrase: passphrase || undefined,
      label: label || undefined,
    });
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success("已複製到剪貼板");
    setTimeout(() => setCopied(null), 2000);
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
          <h1 className="text-2xl font-bold text-slate-900">交易所 API 管理</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add New API Key */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>連接新交易所</CardTitle>
            <CardDescription>
              輸入您的交易所 API 憑證。我們只需要「唯讀」權限，您的資金絕對安全。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  新增 API Key
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>連接交易所</DialogTitle>
                  <DialogDescription>
                    請輸入您的 API 憑證。確保只授予「唯讀」權限。
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Exchange Selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      選擇交易所
                    </label>
                    <Select value={exchange} onValueChange={(v: any) => setExchange(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="binance">Binance (幣安)</SelectItem>
                        <SelectItem value="okx">OKX</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* API Key Input */}
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      API Key
                    </label>
                    <Input
                      type="password"
                      placeholder="輸入您的 API Key"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                  </div>

                  {/* API Secret Input */}
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      API Secret
                    </label>
                    <Input
                      type="password"
                      placeholder="輸入您的 API Secret"
                      value={apiSecret}
                      onChange={(e) => setApiSecret(e.target.value)}
                    />
                  </div>

                  {/* Passphrase (OKX only) */}
                  {exchange === "okx" && (
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        Passphrase (OKX 專用)
                      </label>
                      <Input
                        type="password"
                        placeholder="輸入您的 Passphrase"
                        value={passphrase}
                        onChange={(e) => setPassphrase(e.target.value)}
                      />
                    </div>
                  )}

                  {/* Label */}
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      標籤（可選）
                    </label>
                    <Input
                      placeholder="例如：主帳號、交易機器人"
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
                    {addMutation.isPending ? "連接中..." : "連接"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* API Keys List */}
        <Card>
          <CardHeader>
            <CardTitle>已連接的交易所</CardTitle>
            <CardDescription>
              {apiKeys.length === 0
                ? "您還沒有連接任何交易所"
                : `共 ${apiKeys.length} 個交易所已連接`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {apiKeys.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600 mb-4">尚未連接任何交易所</p>
              </div>
            ) : (
              <div className="space-y-3">
                {apiKeys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">
                        {key.exchange.toUpperCase()}
                        {key.label && ` • ${key.label}`}
                      </div>
                      <div className="text-sm text-slate-600 mt-1">
                        {key.lastSyncedAt
                          ? `最後同步：${new Date(key.lastSyncedAt).toLocaleString("zh-TW")}`
                          : "尚未同步"}
                      </div>
                      {key.lastSyncError && (
                        <div className="text-sm text-red-600 mt-1">
                          錯誤：{key.lastSyncError}
                        </div>
                      )}
                    </div>
                    <AlertDialog open={deleteId === key.id} onOpenChange={(open) => !open && setDeleteId(null)}>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(key.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>刪除 API Key</AlertDialogTitle>
                          <AlertDialogDescription>
                            確定要刪除這個 API Key 嗎？此操作無法撤銷。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="flex gap-3">
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              deleteMutation.mutate({ id: key.id });
                            }}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            刪除
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Info */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">🔒 安全提示</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 space-y-2">
            <p>✓ 您的 API Key 使用 AES-256 加密儲存在我們的伺服器上</p>
            <p>✓ 我們只使用「唯讀」API 權限，無法進行任何交易或提款操作</p>
            <p>✓ 您可以隨時刪除 API Key，我們會立即清除所有相關數據</p>
            <p>✓ 如果您懷疑 API Key 被洩露，請立即在交易所後台重新生成</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
