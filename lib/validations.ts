import { z } from "zod"

export const registrationSchema = z.object({
  nome_completo: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  data_nascimento: z.string().min(1, "Data de nascimento é obrigatória"),
  telefone: z.string().min(10, "Telefone inválido").regex(/^[\d\s\(\)\-\+]+$/, "Telefone inválido"),
  ja_batizado: z.enum(["sim", "nao"], {
    required_error: "Por favor, informe se você já é batizado",
  }),
  denominacao: z.string().optional(),
  culto_dia: z.string().min(1, "Dia da visita do culto é obrigatório"),
  data_visita: z.string().min(1, "Data da visita é obrigatória"),
  consent_lgpd: z.boolean().refine((val) => val === true, {
    message: "Você deve concordar com o tratamento de dados para continuar",
  }),
})

export type RegistrationFormData = z.infer<typeof registrationSchema>


