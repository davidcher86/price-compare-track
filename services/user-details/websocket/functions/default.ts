export const handler = async () => {
    console.log('default route called');
    return { statusCode: 200, body: 'Default route' };
};