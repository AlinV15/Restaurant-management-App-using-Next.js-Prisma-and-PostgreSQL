import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import ConsumView from './ConsumView';
import ConsumEdit from './ConsumEdit';
import LoadingSpinner from '@/app/components/LoadingSpinner';

// Server Component
async function ConsumPage({
    params,
    searchParams
}: {
    params: { slug: string },
    searchParams: { view?: string }
}) {
    const isView = searchParams.view === 'true';
    const consumId = parseInt(params.slug);

    if (isNaN(consumId)) {
        notFound();
    }

    // Fetch all required data
    const [consum, angajati, gestiuni, bunuri] = await Promise.all([
        prisma.consum.findUnique({
            where: { id_consum: consumId },
            include: {
                gestiune: true,
                sef: true,
                liniiConsum: {
                    include: {
                        bun: true
                    }
                }
            }
        }),
        prisma.angajati.findMany(),
        prisma.gestiune.findMany(),
        prisma.bun.findMany()
    ]);

    if (!consum) {
        notFound();
    }

    // Initial data for the store
    const initialData = {
        consum,
        angajati,
        gestiuni,
        bunuri,
        liniiConsum: consum.liniiConsum
    };

    return (
        <Suspense fallback={<LoadingSpinner />}>
            {isView ? (
                <ConsumView initialData={initialData} />
            ) : (
                <ConsumEdit initialData={initialData} />
            )}
        </Suspense>
    );
}

export default ConsumPage;