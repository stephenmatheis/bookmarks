import sql from './db.ts';

const products = await sql`
    select
    *
    from products
`;

console.log(products);

process.exit(0);
