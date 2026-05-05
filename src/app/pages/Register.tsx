import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useAccounts } from "../context/AccountsContext";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

type RegisterForm = {
  name: string;
  email: string;
  pass: string;
};

export function Register() {
  const { register: registerForm, handleSubmit, formState: { errors } } = useForm<RegisterForm>();
  const { register: authRegister } = useAuth();
  const { createAccount } = useAccounts();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const success = await authRegister(data.name, data.email, data.pass);
      if (success) {
        // HU-01: Auto create EFECTIVO default account
        // Since useAccounts creates it using the *current* user from context,
        // we might have a slight race condition if the context hasn't updated yet.
        // Wait, context updates synchronously after setAllAccounts/setUser?
        // In React, context updates are asynchronous (next render). 
        // A simpler way: The `AccountsContext` gets the latest `user` and filtering works.
        // To strictly follow the rules, let's assume `createAccount` needs the user.
        // I will just use setTimeout to defer to next tick.
        setTimeout(() => {
          createAccount("Efectivo Principal", "EFECTIVO", 0);
          toast.success("Registro exitoso. Se ha creado tu cuenta por defecto.");
          navigate("/");
        }, 100);
      }
    } catch (e) {
      toast.error("Ocurrió un error inesperado.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 w-full max-w-md border border-gray-100">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 text-center">Crear una cuenta</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input
            {...registerForm("name", { required: "El nombre es obligatorio" })}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
            placeholder="Ej: Juan Pérez"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
          <input
            {...registerForm("email", { 
              required: "El correo es obligatorio",
              pattern: { value: /\S+@\S+\.\S+/, message: "Formato de correo inválido" }
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
              {...registerForm("pass", { 
                required: "La contraseña es obligatoria",
                minLength: { value: 8, message: "Mínimo 8 caracteres" },
                pattern: {
                  value: /^(?=.*[A-Z])(?=.*\d)/,
                  message: "Debe contener al menos una mayúscula y un número"
                }
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
          <ul className="text-xs text-gray-500 mt-2 list-disc list-inside ml-4">
            <li>Mínimo 8 caracteres</li>
            <li>Al menos una mayúscula</li>
            <li>Al menos un número</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Registrarse"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        ¿Ya tienes una cuenta?{" "}
        <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-500">
          Inicia sesión
        </Link>
      </div>
    </div>
  );
}
