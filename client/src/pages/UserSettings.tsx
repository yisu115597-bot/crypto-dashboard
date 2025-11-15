import { useParams, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { useState } from "react";

export default function UserSettings() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const username = params.username || "unknown";

  const [settings, setSettings] = useState({
    displayName: user?.name || "用戶",
    email: user?.email || "",
    language: "zh-TW",
    theme: "light",
    notificationsEnabled: true,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    console.log("Settings saved:", settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{username} 的設定</h1>
            <p className="text-sm text-slate-600">管理您的帳戶和偏好設定</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {saved && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">✓ 設定已成功保存</p>
          </div>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>帳戶設定</CardTitle>
            <CardDescription>管理您的帳戶基本信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                顯示名稱
              </label>
              <input
                type="text"
                value={settings.displayName}
                onChange={(e) =>
                  setSettings({ ...settings, displayName: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                電子郵箱
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) =>
                  setSettings({ ...settings, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              保存設定
            </Button>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>偏好設定</CardTitle>
            <CardDescription>自定義您的體驗</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                語言
              </label>
              <select
                value={settings.language}
                onChange={(e) =>
                  setSettings({ ...settings, language: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="zh-TW">繁體中文</option>
                <option value="zh-CN">簡體中文</option>
                <option value="en-US">English</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                主題
              </label>
              <select
                value={settings.theme}
                onChange={(e) =>
                  setSettings({ ...settings, theme: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="light">淺色</option>
                <option value="dark">深色</option>
                <option value="auto">自動</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">
                啟用通知
              </label>
              <input
                type="checkbox"
                checked={settings.notificationsEnabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notificationsEnabled: e.target.checked,
                  })
                }
                className="w-4 h-4"
              />
            </div>

            <Button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              保存設定
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>安全設定</CardTitle>
            <CardDescription>管理您的帳戶安全</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full">
              更改密碼
            </Button>
            <Button variant="outline" className="w-full">
              啟用雙因素認證
            </Button>
            <Button variant="destructive" className="w-full">
              登出所有設備
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
