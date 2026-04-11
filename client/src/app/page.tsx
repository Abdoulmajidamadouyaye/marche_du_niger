
import ProductList from '@/components/ProductList'
import PaymentMethods from '@/components/PaymentMethods'
import Image from 'next/image'
import { Suspense } from 'react'

const Homepage = () => {
    return (
        <div className=''>
            {/* Bannière avec les mêmes dimensions que le footer */}
            <div className='relative aspect-[3/1] w-full gap-8 md:justify-between p-8 gap-0 rounded-lg h-64 md:h-80 lg:h-96 overflow-hidden'>
                <Image 
                    src='/featured.jpg' 
                    alt="Featured Product" 
                    fill
                    sizes="100vw"   
                />
                {/* Overlay pour améliorer la lisibilité du texte sur l'image si nécessaire */}
                <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent'></div>
                
                {/* Texte sur la bannière (optionnel) */}
                <div className='absolute bottom-10 left-10 text-white z-10'>
                    <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold mb-2'>MARCHÉ DU NIGER </h1>
                    <p className='text-lg md:text-xl'>Découvrez notre collection exclusive</p>
                </div>
            </div>
            {/* Le reste de votre contenu */}
            <div className='container mx-auto px-4 py-8'>
                <h2 className='text-2xl md:text-3xl font-bold text-gray-900'>Produits disponibles</h2>
                <p className='mt-2 text-gray-600'>
                    Explorez les nouveaux produits avec leurs prix et descriptions detaillees.
                </p>
            </div>
            <Suspense fallback={<div className='container mx-auto px-4 py-6 text-sm text-gray-500'>Chargement des produits...</div>}>
                <ProductList />
            </Suspense>
            <PaymentMethods />
        </div>
    )
}

export default Homepage