
import logoCdcc from '../img/CdccLogo.png'
import img540 from '../img/540.jpg'
import img0016 from '../img/001.6.png'
import img0016var from '../img/001.6_variacao.png'
import style from './style.module.css'
import { useState } from 'react'


export function Nav(){
    const [menuOpen, setMenuOpen] = useState(false)
    const [searchValue, setSearchValue] = useState('')
    const [showImage, setShowImage] = useState(false)
    const [currentImages, setCurrentImages] = useState<string[]>([])
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    const toggleMenu = () => {
        setMenuOpen(!menuOpen)
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearchValue(value)
        
        // Banco de dados de códigos
        const imageDatabase: { [key: string]: string[] } = {
            '540': [img540],
            '001.6': [img0016, img0016var]
        }
        
        if (imageDatabase[value]) {
            setCurrentImages(imageDatabase[value])
            setCurrentImageIndex(0)
            setShowImage(true)
        } else {
            setShowImage(false)
        }
    }

    const nextImage = () => {
        if (currentImageIndex < currentImages.length - 1) {
            setCurrentImageIndex(currentImageIndex + 1)
        }
    }

    const prevImage = () => {
        if (currentImageIndex > 0) {
            setCurrentImageIndex(currentImageIndex - 1)
        }
    }

    return (
        <>
            <nav className={style.navBar}>
                <img src={logoCdcc} alt="logoCdcc" />
                
                {/* Menu Hamburger */}
                <button className={style.hamburger} onClick={toggleMenu}>
                    <span className={`${style.line1} ${menuOpen ? style.open : ''}`}></span>
                    <span className={`${style.line2} ${menuOpen ? style.open : ''}`}></span>
                    <span className={`${style.line3} ${menuOpen ? style.open : ''}`}></span>
                </button>

                {/* Menu Desktop/Tablet */}
                <div className={`${style.menuContainer} ${menuOpen ? style.menuOpen : ''}`}>
                    <p className={style.itens}>Catalogo</p>
                    <input 
                        type="text" 
                        placeholder="Pesquisar..." 
                        className={style.searchBar}
                        value={searchValue}
                        onChange={handleSearchChange}
                    />
                    <p className={style.itens} id="contato-mobile">Contato</p>
                </div>
            
            </nav>

            {/* Exibir imagem quando encontrar o código */}
            {showImage && (
                <div className={style.imageContainer}>
                    <img src={currentImages[currentImageIndex]} alt="QR Code" className={style.resultImage} />
                    
                    {/* Botões de navegação se houver múltiplas imagens */}
                    {currentImages.length > 1 && (
                        <>
                            {currentImageIndex > 0 && (
                                <button className={style.prevButton} onClick={prevImage}>
                                    ◀
                                </button>
                            )}
                            {currentImageIndex < currentImages.length - 1 && (
                                <button className={style.nextButton} onClick={nextImage}>
                                    ▶
                                </button>
                            )}
                            <div className={style.imageCounter}>
                                {currentImageIndex + 1} / {currentImages.length}
                            </div>
                        </>
                    )}
                    
                    <button 
                        className={style.closeButton}
                        onClick={() => {
                            setShowImage(false)
                            setSearchValue('')
                        }}
                    >
                        ✕
                    </button>
                </div>
            )}
        </>
    )
    
}