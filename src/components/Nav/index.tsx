
import logoCdcc from '../img/CdccLogo.png'
import mapaSala1 from '../img/MapaSala1.png'
import mapaSala2 from '../img/MapaSala2.png'
import style from './style.module.css'
import { useState } from 'react'
import { imageDatabaseSala1, imageDatabaseSala2 } from '../../data'
import { Link } from 'react-router-dom'


export function Nav(){
    const [menuOpen, setMenuOpen] = useState(false)
    const [searchValue, setSearchValue] = useState('')
    const [showImage, setShowImage] = useState(false)
    const [currentImages, setCurrentImages] = useState<string[]>([])
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [, setShelvesInfo] = useState<{ name: string; range: string }>({ name: '', range: '' })
    const [activeTab, setActiveTab] = useState<'photo' | 'map'>('photo')
    const [hasSala1, setHasSala1] = useState(false)
    const [hasSala2, setHasSala2] = useState(false)
    const [roomDataSala1, setRoomDataSala1] = useState<{ images: string[]; shelf: string; range: string } | null>(null)
    const [roomDataSala2, setRoomDataSala2] = useState<{ images: string[]; shelf: string; range: string } | null>(null)
    const [activeRoom, setActiveRoom] = useState<1 | 2 | null>(null)

    const toggleMenu = () => {
        setMenuOpen(!menuOpen)
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearchValue(value)
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            let value = (e.target as HTMLInputElement).value.trim()
            
            // PADRÃO 1: Se é 809.89283 com letra (Estantes 10,11,12,13)
            // Ex: "809.89283 R585u2" → "809.89283 R"
            if (value.startsWith('809.89283') && value.includes(' ')) {
                const parts = value.split(' ')
                if (parts.length >= 2) {
                    const firstLetter = parts[1].charAt(0)
                    value = `${parts[0]} ${firstLetter}`
                }
            }
            // PADRÃO 2: Para qualquer outro código com espaço, ignorar espaço e depois
            // Ex: "869.3 A848qb" → "869.3"
            else if (value.includes(' ')) {
                value = value.split(' ')[0]
            }
            
            // Na Sala 1 as chaves têm sufixos (ex: "909_sala1", "500_sala1_est15")
            // então procuramos todas as chaves cuja parte antes do primeiro "_" seja igual ao valor digitado
            // e combinamos as entradas (imagens, estantes e faixas) quando o mesmo número está em mais de uma estante
            const sala1MatchingKeys = Object.keys(imageDatabaseSala1).filter((key) => key.split('_')[0] === value)
            let sala1Entry: { images: string[]; shelf: string; range: string } | undefined

            if (sala1MatchingKeys.length > 0) {
                const images: string[] = []
                const shelvesSet = new Set<string>()
                const rangesSet = new Set<string>()

                sala1MatchingKeys.forEach((key) => {
                    const entry = imageDatabaseSala1[key]
                    if (entry) {
                        images.push(...entry.images)
                        shelvesSet.add(entry.shelf)
                        rangesSet.add(entry.range)
                    }
                })

                sala1Entry = {
                    images,
                    shelf: Array.from(shelvesSet).join(' / '),
                    range: Array.from(rangesSet).join(' / '),
                }
            }
            const sala2Entry = imageDatabaseSala2[value]

            if (!sala1Entry && !sala2Entry) {
                setShowImage(false)
                setHasSala1(false)
                setHasSala2(false)
                setRoomDataSala1(null)
                setRoomDataSala2(null)
                setActiveRoom(null)
                return
            }

            if (sala1Entry) {
                setRoomDataSala1({
                    images: sala1Entry.images,
                    shelf: sala1Entry.shelf,
                    range: sala1Entry.range,
                })
                setHasSala1(true)
            } else {
                setRoomDataSala1(null)
                setHasSala1(false)
            }

            if (sala2Entry) {
                setRoomDataSala2({
                    images: sala2Entry.images,
                    shelf: sala2Entry.shelf,
                    range: sala2Entry.range,
                })
                setHasSala2(true)
            } else {
                setRoomDataSala2(null)
                setHasSala2(false)
            }

            let defaultRoom: 1 | 2 | null = null
            if (sala2Entry) {
                defaultRoom = 2
            } else if (sala1Entry) {
                defaultRoom = 1
            }

            setActiveRoom(defaultRoom)

            if (defaultRoom === 1 && sala1Entry) {
                setCurrentImages(sala1Entry.images)
                setShelvesInfo({ name: sala1Entry.shelf, range: sala1Entry.range })
                setCurrentImageIndex(0)
            }

            if (defaultRoom === 2 && sala2Entry) {
                setCurrentImages(sala2Entry.images)
                setShelvesInfo({ name: sala2Entry.shelf, range: sala2Entry.range })
                setCurrentImageIndex(0)
            }

            setActiveTab('photo')
            setShowImage(true)
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

    // Extrai todas as estantes quando há múltiplas (ex: "Estante 1 / Estante 2") para o mapa da Sala 2
    const extractSala2Shelves = () => {
        if (!roomDataSala2) return [1]
        const matches = roomDataSala2.shelf.match(/\d+/g)
        return matches ? matches.map(m => parseInt(m)) : [1]
    }

    // Extrai todas as estantes para o mapa da Sala 1 (quando há mais de uma estante)
    const extractSala1Shelves = () => {
        if (!roomDataSala1) return [1]
        const matches = roomDataSala1.shelf.match(/\d+/g)
        return matches ? matches.map(m => parseInt(m)) : [1]
    }

    const switchActiveRoom = (room: 1 | 2) => {
        if (room === 1 && roomDataSala1) {
            setActiveRoom(1)
            setCurrentImages(roomDataSala1.images)
            setShelvesInfo({ name: roomDataSala1.shelf, range: roomDataSala1.range })
            setCurrentImageIndex(0)
            setActiveTab('photo')
        }
        if (room === 2 && roomDataSala2) {
            setActiveRoom(2)
            setCurrentImages(roomDataSala2.images)
            setShelvesInfo({ name: roomDataSala2.shelf, range: roomDataSala2.range })
            setCurrentImageIndex(0)
        }
    }

    return (
        <>
            <nav className={style.navBar}>
                <Link to={"/"}><img src={logoCdcc} alt="Logo Oficial do CDCC" /></Link>

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
                    
                   
                        <Link to="/estantes">
                            <p className={style.itens} id="contato-mobile">Estantes</p>
                        </Link>
                    
                </div>
            
            </nav>

            {/* Exibir imagem quando encontrar o código */}
            {showImage && (
                <div className={style.imageContainer}>
                    {/* Info da Estante */}
                    <div className={style.shelfInfo}>
                        {activeRoom && (
                            <div className={style.roomLabel}>Sala {activeRoom}</div>
                        )}
                        {activeRoom === 1 && roomDataSala1 && (
                            <>
                                <div className={style.shelfName}>{roomDataSala1.shelf}</div>
                                <div className={style.shelfRange}>Números: {roomDataSala1.range}</div>
                            </>
                        )}
                        {activeRoom === 2 && roomDataSala2 && (
                            <>
                                <div className={style.shelfName}>{roomDataSala2.shelf}</div>
                                <div className={style.shelfRange}>Números: {roomDataSala2.range}</div>
                            </>
                        )}
                        {hasSala1 && hasSala2 && roomDataSala1 && roomDataSala2 && (
                            <div className={style.otherRoomInfo}>
                                Também em Sala {activeRoom === 1 ? '2' : '1'}: {activeRoom === 1 ? roomDataSala2.shelf : roomDataSala1.shelf} — Números: {activeRoom === 1 ? roomDataSala2.range : roomDataSala1.range}
                            </div>
                        )}
                    </div>

                    {/* Troca rápida entre as salas quando existir em ambas */}
                    {(hasSala1 || hasSala2) && (
                        <div className={style.roomToggle}>
                            {hasSala1 && (
                                <button
                                    className={`${style.roomToggleBtn} ${activeRoom === 1 ? style.roomToggleBtnActive : ''}`}
                                    onClick={() => switchActiveRoom(1)}
                                >
                                    Ver Sala 1
                                </button>
                            )}
                            {hasSala2 && (
                                <button
                                    className={`${style.roomToggleBtn} ${activeRoom === 2 ? style.roomToggleBtnActive : ''}`}
                                    onClick={() => switchActiveRoom(2)}
                                >
                                    Ver Sala 2
                                </button>
                            )}
                        </div>
                    )}

                    {/* Abas para mobile */}
                    <div className={style.tabsContainer}>
                        <button 
                            className={`${style.tabButton} ${activeTab === 'photo' ? style.tabActive : ''}`}
                            onClick={() => setActiveTab('photo')}
                        >
                            Foto
                        </button>
                        {(hasSala1 || hasSala2) && (
                            <button 
                                className={`${style.tabButton} ${activeTab === 'map' ? style.tabActive : ''}`}
                                onClick={() => setActiveTab('map')}
                            >
                                Mapa
                            </button>
                        )}
                    </div>

                    <div className={style.contentWrapper}>
                        {/* Foto - mostrada em desktop sempre, em mobile apenas quando activeTab === 'photo' */}
                        <div className={`${style.photoContainer} ${activeTab !== 'photo' ? style.hidden : ''}`}>
                            <img src={currentImages[currentImageIndex]} alt="QR Code" className={style.resultImage} />
                        </div>
                        
                        {/* Mapa - mostra o mapa da sala atualmente ativa, se existir dados para ela */}
                        {activeTab === 'map' && (
                            <>
                                {activeRoom === 1 && roomDataSala1 && (
                                    <div className={style.mapContainer}>
                                        <div className={style.mapLabel}>Sala 1</div>
                                        <div className={style.mapWrapper}>
                                            <img src={mapaSala1} alt="Mapa da Sala 1" className={style.mapImage} />
                                            {extractSala1Shelves().map((shelfNum) => (
                                                <div
                                                    key={shelfNum}
                                                    className={`${style.mapArrow} ${style[`arrow-sala1-estante-${shelfNum}`]}`}
                                                ></div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {activeRoom === 2 && roomDataSala2 && (
                                    <div className={style.mapContainer}>
                                        <div className={style.mapLabel}>Sala 2</div>
                                        <div className={style.mapWrapper}>
                                            <img src={mapaSala2} alt="Mapa da Sala 2" className={style.mapImage} />
                                            {extractSala2Shelves().map((shelfNum) => (
                                                <div
                                                    key={shelfNum}
                                                    className={`${style.mapArrow} ${style[`arrow-estante-${shelfNum}`]}`}
                                                ></div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    
                    {/* Botões de navegação se houver múltiplas imagens */}
                    {currentImages.length > 1 && (
                        <>
                            {currentImageIndex > 0 && (
                                <button className={style.prevButton} onClick={prevImage} style={{ opacity: activeTab === 'map' ? 0 : 1 }}>
                                    ◀
                                </button>
                            )}
                            {currentImageIndex < currentImages.length - 1 && (
                                <button className={style.nextButton} onClick={nextImage} style={{ opacity: activeTab === 'map' ? 0 : 1 }}>
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
                            setHasSala1(false)
                            setHasSala2(false)
                            setRoomDataSala1(null)
                            setRoomDataSala2(null)
                            setActiveRoom(null)
                        }}
                    >
                        ✕
                    </button>
                </div>
            )}
        </>
    )
    
}