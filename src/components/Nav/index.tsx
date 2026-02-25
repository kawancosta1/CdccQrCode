
import logoCdcc from '../img/CdccLogo.png'
import style from './style.module.css'
import { useState } from 'react'
import { imageDatabase } from '../../data/imageDatabase'


export function Nav(){
    const [menuOpen, setMenuOpen] = useState(false)
    const [searchValue, setSearchValue] = useState('')
    const [showImage, setShowImage] = useState(false)
    const [currentImages, setCurrentImages] = useState<string[]>([])
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [shelveInfo, setShelvesInfo] = useState<{ name: string; range: string }>({ name: '', range: '' })

    const toggleMenu = () => {
        setMenuOpen(!menuOpen)
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearchValue(value)
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const value = (e.target as HTMLInputElement).value
            if (imageDatabase[value]) {
                setCurrentImages(imageDatabase[value].images)
                setShelvesInfo({ name: imageDatabase[value].shelf, range: imageDatabase[value].range })
                setCurrentImageIndex(0)
                setShowImage(true)
            } else {
                setShowImage(false)
            }
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
                <img src={logoCdcc} alt="Logo Oficial do CDCC" />
                
                {/* Menu Hamburger */}
                <button className={`${style.hamburger} ${menuOpen ? style.open : ''}`} onClick={toggleMenu}>
                    <span className={`${style.line1} ${menuOpen ? style.open : ''}`}></span>
                    <span className={`${style.line2} ${menuOpen ? style.open : ''}`}></span>
                    <span className={`${style.line3} ${menuOpen ? style.open : ''}`}></span>
                </button>

                {/* Menu Desktop/Tablet */}
                <div className={`${style.menuContainer} ${menuOpen ? style.menuOpen : ''}`}>
                    <input 
                        type="text" 
                        placeholder="Pesquisar..." 
                        className={style.searchBar}
                        value={searchValue}
                        onChange={handleSearchChange}
                        onKeyDown={handleKeyPress}
                    />
                    <p className={style.itens} id="contato-mobile">Contato</p>
                </div>
            
            </nav>

            {/* Exibir imagem quando encontrar o código */}
            {showImage && (
                <div className={style.imageContainer}>
                    {/* Info da Estante */}
                    <div className={style.shelfInfo}>
                        <div className={style.shelfName}>{shelveInfo.name}</div>
                        <div className={style.shelfRange}>Números: {shelveInfo.range}</div>
                    </div>

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