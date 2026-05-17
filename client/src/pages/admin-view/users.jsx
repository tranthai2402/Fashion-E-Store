import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllUsers, updateUserRole, deleteUser } from "@/store/admin/user-slice";
import { Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function getPaginationItems(currentPage, totalPages) {
  if (totalPages <= 6) {
    return Array.from({ length: totalPages }, (_, idx) => idx + 1);
  }

  const lastPage = totalPages;
  const lastTwo = [lastPage - 1, lastPage];

  if (currentPage <= 2) {
    return [1, 2, 3, "ellipsis", ...lastTwo];
  }

  if (currentPage === 3) {
    return [1, 2, 3, 4, "ellipsis", ...lastTwo];
  }

  if (currentPage >= 4 && currentPage <= lastPage - 3) {
    return [
      1,
      "ellipsis",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "ellipsis",
      ...lastTwo,
    ];
  }

  return [1, "ellipsis", lastPage - 3, lastPage - 2, lastPage - 1, lastPage];
}

function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const dispatch = useDispatch();
  const { userList, isLoading } = useSelector((state) => state.adminUser);
  const { toast } = useToast();

  const filteredUserList =
    userList && userList.length > 0
      ? userList.filter((userItem) => {
          const uName = (userItem?.userName || "").toLowerCase();
          const uEmail = (userItem?.email || "").toLowerCase();
          const sTerm = (searchTerm || "").toLowerCase();
          
          const matchesSearch = uName.includes(sTerm) || uEmail.includes(sTerm);
          const matchesRole =
            roleFilter === "all" || userItem.role === roleFilter;

          return matchesSearch && matchesRole;
        })
      : [];

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, userList]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUserList.length / itemsPerPage)
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUserList.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const pageButtons = getPaginationItems(safeCurrentPage, totalPages);

  function handleUpdateRole(userId, currentRole) {
    const newRole = currentRole === "admin" ? "user" : "admin";
    dispatch(updateUserRole({ userId, role: newRole })).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllUsers());
        toast({
          title: "Success",
          description: data?.payload?.message,
        });
      }
    });
  }

  function handleDeleteUser(userId) {
    if (window.confirm("Are you sure you want to delete this user?")) {
      dispatch(deleteUser(userId)).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllUsers());
          toast({
            title: "Success",
            description: data?.payload?.message,
          });
        }
      });
    }
  }

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <CardTitle className="text-xl font-bold">User Management</CardTitle>
        <div className="flex items-center gap-4">
          <div className="relative w-[250px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name or email..."
              className="pl-8 bg-background"
            />
          </div>
          <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 min-h-[520px]">
        <div className="flex-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>User Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers && paginatedUsers.length > 0
                ? paginatedUsers.map((userItem) => (
                    <TableRow key={userItem._id}>
                      <TableCell className="font-medium">{userItem._id}</TableCell>
                      <TableCell>{userItem.userName}</TableCell>
                      <TableCell>{userItem.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            userItem.role === "admin" ? "default" : "secondary"
                          }
                        >
                          {userItem.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() =>
                              handleUpdateRole(userItem._id, userItem.role)
                            }
                            size="sm"
                          >
                            Change Role
                          </Button>
                          <Button
                            onClick={() => handleDeleteUser(userItem._id)}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                : null}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">
            Showing {filteredUserList.length === 0 ? 0 : startIndex + 1}
            {" - "}
            {Math.min(startIndex + itemsPerPage, filteredUserList.length)} of{" "}
            {filteredUserList.length}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={safeCurrentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </Button>
            {pageButtons.map((page, index) =>
              page === "ellipsis" ? (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 text-sm text-muted-foreground"
                >
                  ...
                </span>
              ) : (
                <Button
                  key={page}
                  variant={page === safeCurrentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              )
            )}
            <Button
              variant="outline"
              size="sm"
              disabled={safeCurrentPage === totalPages}
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default AdminUsers;
