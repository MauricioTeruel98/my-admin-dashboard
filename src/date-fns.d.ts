declare module "date-fns" {
  export function parseISO(date: string | number | Date): Date;
  export function format(
    date: Date | number,
    format: string,
    options?: {}
  ): string;
  // Añade aquí otras funciones que estés utilizando de date-fns
}
