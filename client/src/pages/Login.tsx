import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE } from "@/const";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<"user1" | "admin" | null>(null);

  const users = [
    {
      id: "user1",
      name: "測試用戶 1",
      email: "test1@example.com",
      role: "user",
      description: "普通用戶帳號",
    },
    {
      id: "admin",
      name: "測試管理員",
      email: "admin@example.com",
      role: "admin",
      description: "管理員帳號",
    },
  ];

  const handleLogin = async (userId: "user1" | "admin") => {
    setIsLoading(true);
    try {
      // 調用測試認證 API
      const response = await fetch(`/api/test-auth/login/${userId}`);
      if (response.ok) {
        // 登入成功,重定向到首頁
        setLocation("/");
      } else {
        alert("登入失敗,請重試");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("登入出錯");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <img src={APP_LOGO} alt="Logo" className="w-16 h-16 mx-auto mb-4 rounded-lg" />
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{APP_TITLE}</h1>
          <p className="text-slate-600">選擇帳號登入</p>
        </div>

        {/* Login Cards */}
        <div className="space-y-4 mb-8">
          {users.map((user) => (
            <Card
              key={user.id}
              className={`cursor-pointer transition-all ${
                selectedUser === user.id
                  ? "ring-2 ring-blue-500 border-blue-500"
                  : "hover:border-slate-300"
              }`}
              onClick={() => setSelectedUser(user.id as "user1" | "admin")}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === "admin"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    {user.role === "admin" ? "管理員" : "用戶"}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">{user.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Login Button */}
        <Button
          onClick={() => selectedUser && handleLogin(selectedUser)}
          disabled={!selectedUser || isLoading}
          size="lg"
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              登入中...
            </>
          ) : (
            "登入"
          )}
        </Button>

        {/* Info */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-slate-600">
            <strong>本機測試模式:</strong> 這是開發環境,使用測試帳號登入。生產環境需使用真實帳號認證。
          </p>
        </div>
      </div>
    </div>
  );
}
