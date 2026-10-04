export const STORE_POLICIES = {
  updatedAt: "4 de octubre de 2026",
  owner: "Lionel Davor Aguirre Gomero",
  address: "Esperanza Baja, Jr. Huáscar, Mz. S, Lt. 18, Chimbote, Perú",
  email: "lioneldavor26@gmail.com",
  area: "Chimbote",
  voluntaryChangeDays: 7,
  // Completar con el RUC real antes de habilitar el Libro de Reclamaciones.
  ruc: process.env.NEXT_PUBLIC_STORE_RUC?.trim() || "",
};

export const COMPLAINT_BOOK_ENABLED = process.env.NEXT_PUBLIC_COMPLAINT_BOOK_ENABLED === "true" && /^\d{11}$/.test(STORE_POLICIES.ruc);
