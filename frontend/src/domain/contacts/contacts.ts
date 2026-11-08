import type { Currency } from "../entities";

/**
 * La API no expone un directorio de usuarios. Para que la transferencia P2P
 * sea usable, el frontend mantiene este directorio con las cuentas del seed.
 * Está aislado acá para que reemplazarlo por un endpoint real sea un cambio
 * de una sola pieza.
 */
export interface ContactAccount {
  accountId: string;
  userId: string;
  ownerName: string;
  accountName: string;
  currency: Currency;
}

export interface ContactGroup {
  userId: string;
  ownerName: string;
  accounts: ContactAccount[];
}

export const CONTACT_DIRECTORY: readonly ContactAccount[] = [
  {
    accountId: "acc-1",
    userId: "user-1",
    ownerName: "Usuario Demo",
    accountName: "Cuenta Pesos",
    currency: "ARS",
  },
  {
    accountId: "acc-2",
    userId: "user-1",
    ownerName: "Usuario Demo",
    accountName: "Cuenta Dolares",
    currency: "USD",
  },
  {
    accountId: "acc-3",
    userId: "user-2",
    ownerName: "Test User",
    accountName: "Cuenta Principal",
    currency: "ARS",
  },
  {
    accountId: "acc-4",
    userId: "user-3",
    ownerName: "Ana Perez",
    accountName: "Cuenta de Ana",
    currency: "ARS",
  },
];

export function contactsForUser(
  userId: string,
  directory: readonly ContactAccount[] = CONTACT_DIRECTORY,
): ContactAccount[] {
  return directory.filter((contact) => contact.userId !== userId);
}

export function groupContacts(contacts: readonly ContactAccount[]): ContactGroup[] {
  const groups = new Map<string, ContactGroup>();

  for (const contact of contacts) {
    const existing = groups.get(contact.userId);
    if (existing) {
      existing.accounts.push(contact);
    } else {
      groups.set(contact.userId, {
        userId: contact.userId,
        ownerName: contact.ownerName,
        accounts: [contact],
      });
    }
  }

  return [...groups.values()];
}

export function findContact(
  accountId: string | null,
  directory: readonly ContactAccount[] = CONTACT_DIRECTORY,
): ContactAccount | null {
  if (!accountId) return null;
  return directory.find((contact) => contact.accountId === accountId) ?? null;
}

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function filterContacts(
  contacts: readonly ContactAccount[],
  search: string,
): ContactAccount[] {
  const term = search.trim().toLocaleLowerCase("es-AR");
  if (!term) return [...contacts];

  return contacts.filter((contact) =>
    [contact.ownerName, contact.accountName, contact.currency].some((value) =>
      value.toLocaleLowerCase("es-AR").includes(term),
    ),
  );
}
