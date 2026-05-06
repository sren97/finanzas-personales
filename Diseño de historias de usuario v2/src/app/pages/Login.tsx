import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

type LoginForm = {
  email: string;
  pass: string;
};

export function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const success = await login(data.email, data.pass);
      if (success) {
        toast.success("Inicio de sesión exitoso");
        navigate("/");
      }
    } catch (e) {
      // Error is handled in context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 w-full max-w-md border border-gray-100">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 text-center">Inicia sesión en tu cuenta</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
          <input
            {...register("email", { 
              required: "El correo es obligatorio"
            })}
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
            placeholder="usuario@correo.com"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <div className="relative">
            <input
              {...register("pass", { 
                required: "La contraseña es obligatoria",
              })}
              type={showPassword ? "text" : "password"}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-emerald-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.pass && <p className="mt-1 text-sm text-red-600">{errors.pass.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Iniciar sesión"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        ¿No tienes una cuenta?{" "}
        <Link to="/register" className="font-medium text-emerald-600 hover:text-emerald-500">
          Regístrate
        </Link>
      </div>
    </div>
  );
}
