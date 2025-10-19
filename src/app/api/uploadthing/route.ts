import { createRouteHandler } from 'uploadthing/next';

import { ourFileRouter } from '@/app/api/uploadthing/uploadthing.ts';

export const { GET, POST } = createRouteHandler({ router: ourFileRouter });
