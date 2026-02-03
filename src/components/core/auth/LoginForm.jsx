import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { login } from "@/services/operations/authAPI";
import { setUser, setToken, setLoading } from "@/redux/slices/authSlice";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { SpinnerCustom } from "@/components/ui/spinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function LoginForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    dispatch(setLoading(true));

    try {
      const response = await login(formData);
      if (response.success) {
        dispatch(setUser(response.user));
        dispatch(setToken(response.token));
        toast.success("Logged in successfully!");
        navigate("/dashboard");
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || "Login failed. Please check your credentials.";
      toast.error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Email</label>
            <Input
              type="email"
              placeholder="you@college.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <SpinnerCustom /> : "Login"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default LoginForm;
