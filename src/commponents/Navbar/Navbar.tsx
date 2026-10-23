import logo from "../../assets/route.png";

import { Button, Dropdown, Label, Tabs } from "@heroui/react";

import { Bell, House,  LogOut,  Menu,  Settings as SettingsIcon, User } from "lucide-react";


import { useQuery } from "@tanstack/react-query";
import { useTokenContext } from "../context/Tokencontext";
import { Link, useLocation, useNavigate } from "react-router";
import { useUserContext } from "../context/UserContex";

import { getUnreadNotificationsCount } from "../../Services/notification.services";

export default function Navbar() {
  const { setToken } = useTokenContext();

  const { userDetails } = useUserContext();

  const location = useLocation();
  const navigate = useNavigate();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notificationsUnreadCount"],
    queryFn: async () => {
      const { data } = await getUnreadNotificationsCount();

      const payload = data?.data;

      const count =
        typeof payload === "number"
          ? payload
          : (payload?.count ?? payload?.unreadCount ?? data?.count ?? 0);

      return Number(count) || 0;
    },
    enabled: Boolean(localStorage.getItem("userToken")),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  function logout() {
    localStorage.removeItem("userToken");
    setToken(null);
  }

  const activeTab = location.pathname.startsWith("/notefication")
    ? "Notifications"
    : location.pathname.toLowerCase().startsWith("/profile")
      ? "Profile"
      : "feed";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white py-3 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="nav-logo flex gap-2">
          <img src={logo} width={50} className="rounded-2xl" alt="logo" />

          <h1 className="mt-3 text-xl font-bold">Route Posts</h1>
        </div>

        <div className="nav-links">
          <Tabs selectedKey={activeTab} className="w-full max-w-md">
            <Tabs.ListContainer>
              <Tabs.List aria-label="Options">
                <Tabs.Tab id="feed" className="flex gap-3">
                  <House />

                  <Link to="/feed">Feed</Link>

                  <Tabs.Indicator />
                </Tabs.Tab>

                <Tabs.Tab id="Profile" className="flex gap-3">
                  <User />

                  <Link to="/Profile">Profile</Link>

                  <Tabs.Indicator />
                </Tabs.Tab>

                <Tabs.Tab id="Notifications" className="flex gap-3">
                  <Bell />

                  <Link
                    to="/notefication"
                    className="flex items-center gap-1.5"
                  >
                    Notifications
                    {unreadCount > 0 && (
                      <span className="grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </Link>

                  <Tabs.Indicator />
                </Tabs.Tab>
              </Tabs.List>
            </Tabs.ListContainer>
          </Tabs>
        </div>

        
<div className="nav-action">
  <Dropdown>
    <Button
      aria-label="Open profile menu"
      variant="secondary"
      className="flex items-center gap-3 rounded-full border border-gray-200 bg-[#f8fafc] px-4 py-2 text-[#243b5a]"
    >
      <img
        src={userDetails?.photo}
        alt="Profile"
        className="h-8 w-8 rounded-full object-cover"
      />

      <span className="text-sm font-medium">
        {userDetails?.name}
      </span>

      <Menu size={18} className="text-gray-500" />
    </Button>

    <Dropdown.Popover>
      <Dropdown.Menu
        className="min-w-[240px] rounded-2xl bg-white p-2 shadow-lg"
      >
        <Dropdown.Item
          id="Profile"
          textValue="Profile"
          onClick={() => navigate("/profile")}
          className="rounded-lg"
        >
          <User size={19} />
          <Label>Profile</Label>
        </Dropdown.Item>

        <Dropdown.Item
          id="Settings"
          textValue="Settings"
          onClick={() => navigate("/settings")}
          className="rounded-lg"
        >
          <SettingsIcon size={19} />
          <Label>Settings</Label>
        </Dropdown.Item>

        <Dropdown.Item
          id="logout"
          textValue="Logout"
          variant="danger"
          onClick={logout}
          className="mt-2 border-t border-gray-200 pt-3"
        >
          <LogOut size={19} />
          <Label>Logout</Label>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown.Popover>
  </Dropdown>
</div>

      </div>
    </nav>
  );
}
