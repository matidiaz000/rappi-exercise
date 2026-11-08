import { describe, expect, it } from "vitest";
import {
  CONTACT_DIRECTORY,
  contactsForUser,
  filterContacts,
  findContact,
  getInitials,
  groupContacts,
} from "./contacts";

describe("contactsForUser", () => {
  it("excluye las cuentas del usuario actual", () => {
    const contacts = contactsForUser("user-1");
    expect(contacts.map((contact) => contact.accountId)).toEqual([
      "acc-3",
      "acc-4",
    ]);
  });

  it("incluye todas las cuentas de otros usuarios", () => {
    const contacts = contactsForUser("user-2");
    expect(contacts).toHaveLength(3);
    expect(contacts.some((contact) => contact.userId === "user-2")).toBe(false);
  });
});

describe("groupContacts", () => {
  it("agrupa las cuentas por dueño", () => {
    const groups = groupContacts(CONTACT_DIRECTORY);
    expect(groups).toHaveLength(3);

    const demo = groups.find((group) => group.userId === "user-1");
    expect(demo?.accounts).toHaveLength(2);
    expect(demo?.accounts.map((account) => account.currency)).toEqual([
      "ARS",
      "USD",
    ]);
  });

  it("devuelve una lista vacía sin contactos", () => {
    expect(groupContacts([])).toEqual([]);
  });
});

describe("findContact", () => {
  it("busca por id de cuenta", () => {
    expect(findContact("acc-4")?.ownerName).toBe("Ana Perez");
  });

  it("devuelve null para ids inexistentes o nulos", () => {
    expect(findContact("acc-999")).toBeNull();
    expect(findContact(null)).toBeNull();
  });
});

describe("getInitials", () => {
  it("toma hasta dos iniciales", () => {
    expect(getInitials("Ana Perez")).toBe("AP");
    expect(getInitials("Usuario Demo Completo")).toBe("UD");
    expect(getInitials("  ana  ")).toBe("A");
  });
});

describe("filterContacts", () => {
  it("busca por nombre, cuenta o moneda sin distinguir mayúsculas", () => {
    expect(filterContacts(CONTACT_DIRECTORY, "ana")).toHaveLength(1);
    expect(filterContacts(CONTACT_DIRECTORY, "dolares")).toHaveLength(1);
    expect(filterContacts(CONTACT_DIRECTORY, "USD")[0].accountId).toBe("acc-2");
  });

  it("devuelve todo si la búsqueda está vacía", () => {
    expect(filterContacts(CONTACT_DIRECTORY, "   ")).toHaveLength(4);
  });

  it("devuelve una lista vacía si no hay coincidencias", () => {
    expect(filterContacts(CONTACT_DIRECTORY, "inexistente")).toEqual([]);
  });
});
