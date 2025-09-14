import sql from './db';

export default async function Get() {
    const products = await sql`
        select
        *
        from products
    `;

    return products;
}
