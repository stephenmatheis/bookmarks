export async function GET(request: Request) {
    const { url } = request;

    console.log(url);

    return new Response(['GET', url].join('\n'), {
        status: 200,
    });
}

export async function POST(request: Request) {
    const { url } = request;

    try {
        const body = await request.json();

        return new Response(
            JSON.stringify({
                url,
                body,
            }),
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error(error);

        return new Response(
            JSON.stringify({
                url,
                message: 'missing body',
            }),
            {
                status: 400,
            }
        );
    }
}
