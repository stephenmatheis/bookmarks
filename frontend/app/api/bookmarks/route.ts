import sql from '@/lib/db';

export async function GET(request: Request) {
    const { url } = request;

    console.log(url);

    return new Response(['GET', url].join('\n'), {
        status: 200,
    });
}

export async function POST(request: Request) {
    try {
        const { url, title, timestamp } = await request.json();

        await sql`
            INSERT into bookmarks
            VALUES(${url}, ${title}, ${timestamp})       
        `;

        return new Response(JSON.stringify({ message: 'inserted 1 row into bookmarks' }), {
            status: 200,
        });
    } catch (error) {
        console.error(error);

        return new Response(
            JSON.stringify({
                message: 'missing body',
            }),
            {
                status: 400,
            }
        );
    }
}
