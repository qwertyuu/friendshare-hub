import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Register() {
  const navigate = useNavigate();

  useEffect(() => {
    toast.info("Utilise le bouton de connexion pour accéder à l'application.");
    navigate("/login");
  }, [navigate]);

  return null;
}
