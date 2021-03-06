import React from 'react'
import {useState, useEffect} from 'react'
import Header from './Header'
import Main from './Main'
import Footer from './Footer'
import PopupWithForm from './PopupWithForm'
import ImagePopup from './ImagePopup'
import ESC_KEYCODE from '../utils/keycode'
import api from "../utils/api";
import {UserContext} from '../contexts/CurrentUserContext'
import EditProfilePopup from './EditProfilePopup'
import EditAvatarPopup from './EditAvatarPopup'
import AddPlacePopup from './AddPlacePopup'

function App() {
    const [currentUser, setCurrentUser] = useState({
        name: '',
        about: '',
        avatar: ''
    });

    const [cards, setCards] = useState([]);
    //получаем информацию о карточках и пользователе
    useEffect(() => {
        api.getAllData()
            .then((response => {
                const [userData, cardsData] = response;
                setCards(cardsData);
                setCurrentUser(userData);
            }))
            .catch((err) => {
                console.log(err);
            })
    }, [])
    //функционал для открытия и закрытия попаов
    const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);

    function handleEditProfileClick() {
        setIsEditProfilePopupOpen(!isEditProfilePopupOpen);
        console.log(currentUser)
    }

    const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);

    function handleAddPlaceClick() {
        setIsAddPlacePopupOpen(!isAddPlacePopupOpen);
    }

    const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);

    function handleEditAvatarClick() {
        setIsEditAvatarPopupOpen(!isEditAvatarPopupOpen);
    }

    const [selectedCard, setSelectedCard] = useState(false);

    function handleCardClick(card) {
        setSelectedCard(card);
    }

    function closeAllPopups() {
        setIsEditProfilePopupOpen(false);
        setIsAddPlacePopupOpen(false);
        setIsEditAvatarPopupOpen(false);
        setSelectedCard(false);
    }

    function onKeyPressed(e) {
        if (e.keyCode === ESC_KEYCODE) {
            closeAllPopups();
        }
    }

    //отрисовка лайков и запрос в api
    function handleCardLike(item) {
        const isLiked = item.likes.some(i => i._id === currentUser._id);

        api.changeLikeCardStatus(item._id, !isLiked).then((newCard) => {
            const newCards = cards.map((c) => c._id === item._id ? newCard : c);
            setCards(newCards);
        })
            .catch((err) => {
                console.log(err);
            });

    }

    //обновление информации о пользователе
    function handleUpdateUser(data) {
        api.saveEditedInfo(data)
            .then((data) => {
                setCurrentUser(data);
                closeAllPopups();
            })
            .catch((err) => {
                console.log(err);
            });
    }
    //удаление карточки
    function handleCardDelete(item) {

        api.deleteCard(item._id).then(() => {
            // Формируем новый массив на основе имеющегося, подставляя в него новую карточку
            const newCards = cards.filter((c) => c._id !== item._id);
            // Обновляем стейт
            setCards(newCards);
        })
            .catch((err) => {
                console.log(err);
            });
    }
    //обновление аватара
    function handleUpdateAvatar(userData) {
        api.updateAvatar(userData)
            .then((data) => {
                setCurrentUser(data);
                closeAllPopups();
            })
            .catch((err) => {
                console.log(err);
            });
    }
    // добавление новой карточки
    function handleAddPlaceSubmit(formData) {
        api.addNewCard(formData)
            .then((newCard) => {
                setCards([newCard, ...cards])
                closeAllPopups();
            })
            .catch((err) => {
                console.log(err);
            });
    }

    return (
        <UserContext.Provider value={currentUser}>
            <div className="body" onKeyDown={onKeyPressed} tabIndex="0">
                <div className="page">

                    <Header/>
                    <Main onEditProfile={handleEditProfileClick} onAddPlace={handleAddPlaceClick}
                          onEditAvatar={handleEditAvatarClick} onCardClick={handleCardClick}
                          cards={cards} onCardLike={handleCardLike} onCardDelete={handleCardDelete}/>
                    <Footer/>

                    <EditProfilePopup isOpen={isEditProfilePopupOpen} onClose={closeAllPopups}
                                      onUpdateUser={handleUpdateUser}/>

                    <EditAvatarPopup isOpen={isEditAvatarPopupOpen} onClose={closeAllPopups}
                                     onUpdateAvatar={handleUpdateAvatar}/>

                    <AddPlacePopup isOpen={isAddPlacePopupOpen} onClose={closeAllPopups}
                                   onAddPlace={handleAddPlaceSubmit}/>

                    <PopupWithForm id='popupConfirm' title='Вы уверены?' name='confirm'>
                    </PopupWithForm>
                    <ImagePopup id='popupImage' card={selectedCard} onClose={closeAllPopups}>
                    </ImagePopup>
                </div>
            </div>
        </UserContext.Provider>

    );
}

export default App;
