import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users, Settings, BarChart3, Edit, Trash2 } from "lucide-react";
import { useState } from "react";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"users" | "system" | "stats">("users");

  // 模擬用戶數據
  const [users] = useState([
    { id: 1, name: "測試用戶 1", email: "test1@example.com", role: "user", status: "active" },
    { id: 2, name: "測試管理員", email: "admin@example.com", role: "admin", status: "active" },
  ]);

  // 統計數據
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === "active").length,
    totalRequests: 15234,
    systemHealth: "99.8%",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-slate-900">管理員儀表板</h1>
          </div>
          <div className="text-sm text-slate-600">
            登入身份：<span className="font-semibold">{user?.name}</span>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-4">
          <button
            onClick={() => setActiveTab("users")}
            className={`py-4 px-4 border-b-2 font-medium text-sm transition ${
              activeTab === "users"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="w-4 h-4 inline-block mr-2" />
            使用者管理
          </button>
          <button
            onClick={() => setActiveTab("system")}
            className={`py-4 px-4 border-b-2 font-medium text-sm transition ${
              activeTab === "system"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Settings className="w-4 h-4 inline-block mr-2" />
            系統設定
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`py-4 px-4 border-b-2 font-medium text-sm transition ${
              activeTab === "stats"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <BarChart3 className="w-4 h-4 inline-block mr-2" />
            統計信息
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Users Management */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">使用者管理</h2>
              <Button className="bg-blue-600 hover:bg-blue-700">
                新增使用者
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>所有使用者</CardTitle>
                <CardDescription>共 {users.length} 位使用者</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-slate-200">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold">姓名</th>
                        <th className="text-left py-3 px-4 font-semibold">電郵</th>
                        <th className="text-left py-3 px-4 font-semibold">角色</th>
                        <th className="text-left py-3 px-4 font-semibold">狀態</th>
                        <th className="text-left py-3 px-4 font-semibold">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((userItem) => (
                        <tr key={userItem.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4">{userItem.name}</td>
                          <td className="py-3 px-4 text-slate-600">{userItem.email}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                              {userItem.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                              {userItem.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* System Settings */}
        {activeTab === "system" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">系統設定</h2>

            <Card>
              <CardHeader>
                <CardTitle>應用配置</CardTitle>
                <CardDescription>管理應用的基本設置</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    應用名稱
                  </label>
                  <input
                    type="text"
                    defaultValue="加密資產儀表板"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    維護模式
                  </label>
                  <input type="checkbox" className="w-4 h-4" />
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">保存設定</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>數據備份</CardTitle>
                <CardDescription>管理應用數據</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full">
                  下載備份
                </Button>
                <Button variant="outline" className="w-full">
                  還原備份
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Statistics */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">統計信息</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">總使用者數</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{stats.totalUsers}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">活躍使用者</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{stats.activeUsers}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">總請求數</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{stats.totalRequests}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">系統健康度</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{stats.systemHealth}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>系統日誌</CardTitle>
                <CardDescription>最近的系統事件</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <div>
                      <p className="text-sm font-medium">系統啟動</p>
                      <p className="text-xs text-slate-600">2025-11-16 00:00:00</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">成功</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <div>
                      <p className="text-sm font-medium">數據同步完成</p>
                      <p className="text-xs text-slate-600">2025-11-15 23:30:00</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">成功</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
