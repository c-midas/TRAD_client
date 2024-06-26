import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import Tooltip from 'rc-tooltip';
import AccordionItem from '../../../../../common/Accordion/AccordionItem';
import Button from '../../../../../common/Button/Button';
import {
  addApplicationNoteAction,
  deleteApplicationNoteAction,
  getApplicationNotesList,
  updateApplicationNoteAction,
} from '../../../redux/ApplicationAction';
import Modal from '../../../../../common/Modal/Modal';
import DropdownMenu from '../../../../../common/DropdownMenu/DropdownMenu';
import { errorNotification } from '../../../../../common/Toast';
import NotesDescription from './NotesDescription';

const NOTE_ACTIONS = {
  ADD: 'ADD',
  EDIT: 'EDIT',
};

const initialApplicationNoteState = {
  noteId: null,
  description: '',
  type: NOTE_ACTIONS.ADD,
};

const APPLICATION_NOTE_REDUCER_ACTIONS = {
  UPDATE_DATA: 'UPDATE_DATA',
  UPDATE_SINGLE_DATA: 'UPDATE_SINGLE_DATA',
  RESET_STATE: 'RESET_STATE',
};

function applicationNoteReducer(state, action) {
  switch (action.type) {
    case APPLICATION_NOTE_REDUCER_ACTIONS.UPDATE_SINGLE_DATA:
      return {
        ...state,
        [`${action.name}`]: action.value,
      };
    case APPLICATION_NOTE_REDUCER_ACTIONS.UPDATE_DATA:
      return {
        ...state,
        ...action.data,
      };
    case APPLICATION_NOTE_REDUCER_ACTIONS.RESET_STATE:
      return { ...initialApplicationNoteState };
    default:
      return state;
  }
}

const ApplicationNotesAccordion = props => {
  const dispatch = useDispatch();
  const { applicationId, index } = props;
  const { applicationDetail } = useSelector(
    ({ application }) => application?.viewApplication ?? {}
  );

  const { status } = useMemo(() => applicationDetail ?? {}, [applicationDetail]);

  const [currentNoteId, setCurrentNoteId] = useState('');
  const [editNoteDetails, setEditNoteDetails] = useState([]);

  const applicationNoteList = useSelector(
    ({ application }) => application?.viewApplication?.notes?.noteList?.docs || []
  );

  const {
    viewApplicationEditNoteButtonLoaderAction,
    viewApplicationAddNewNoteButtonLoaderAction,
    viewApplicationDeleteNoteButtonLoaderAction,
  } = useSelector(({ generalLoaderReducer }) => generalLoaderReducer ?? false);

  // add task
  const [modifyNoteModal, setModifyNoteModal] = useState(false);

  const toggleModifyNotes = useCallback(
    value => setModifyNoteModal(value !== undefined ? value : e => !e),
    [setModifyNoteModal]
  );

  const [selectedApplicationNote, dispatchSelectedApplicationNote] = useReducer(
    applicationNoteReducer,
    initialApplicationNoteState
  );

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const toggleConfirmationModal = useCallback(
    value => setShowConfirmModal(value !== undefined ? value : e => !e),
    [setShowConfirmModal]
  );

  const [showActionMenu, setShowActionMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const onClickActionToggleButton = useCallback(
    (e, note) => {
      e.persist();
      e.stopPropagation();
      const menuTop = e.clientY + 10;
      const menuLeft = e.clientX - 90;
      setShowActionMenu(prev => !prev);
      setMenuPosition({ top: menuTop, left: menuLeft });
      setCurrentNoteId(note._id);
      setEditNoteDetails(note);
    },
    [setShowActionMenu, setMenuPosition, setCurrentNoteId, setEditNoteDetails]
  );

  const callBack = useCallback(() => {
    dispatch(getApplicationNotesList(applicationId));
    toggleConfirmationModal();
  }, [applicationId, toggleConfirmationModal]);

  const onCloseNotePopup = useCallback(() => {
    dispatchSelectedApplicationNote({
      type: APPLICATION_NOTE_REDUCER_ACTIONS.RESET_STATE,
    });
    toggleModifyNotes();
  }, [toggleModifyNotes, dispatchSelectedApplicationNote]);

  const onChangeSelectedNoteInput = useCallback(
    e => {
      dispatchSelectedApplicationNote({
        type: APPLICATION_NOTE_REDUCER_ACTIONS.UPDATE_SINGLE_DATA,
        name: e.target.name,
        value: e.target.value,
      });
    },
    [dispatchSelectedApplicationNote]
  );

  const addOrUpdateNote = useCallback(async () => {
    const noteData = {
      description: selectedApplicationNote.description,
    };
    try {
      if (noteData?.description?.trim()?.length > 0) {
        if (selectedApplicationNote.type === NOTE_ACTIONS.ADD) {
          await dispatch(addApplicationNoteAction(applicationId, noteData));
        } else {
          noteData.noteId = selectedApplicationNote.noteId;
          await dispatch(updateApplicationNoteAction(applicationId, noteData));
        }
        dispatchSelectedApplicationNote({
          type: APPLICATION_NOTE_REDUCER_ACTIONS.RESET_STATE,
        });
        toggleModifyNotes();
      } else {
        errorNotification('Please Enter Description');
      }
    } catch (e) {
      /**/
    }
  }, [selectedApplicationNote, toggleModifyNotes]);

  const onEditNoteClick = useCallback(() => {
    setShowActionMenu(!showActionMenu);
    const { _id, description } = editNoteDetails;
    const data = {
      noteId: _id,
      description,
      type: NOTE_ACTIONS.EDIT,
    };
    dispatchSelectedApplicationNote({
      type: APPLICATION_NOTE_REDUCER_ACTIONS.UPDATE_DATA,
      data,
    });
    toggleModifyNotes();
  }, [
    setShowActionMenu,
    showActionMenu,
    editNoteDetails,
    dispatchSelectedApplicationNote,
    toggleModifyNotes,
  ]);

  const onDeleteNoteClick = useCallback(() => {
    setShowActionMenu(!showActionMenu);
    toggleConfirmationModal();
  }, [toggleConfirmationModal, setShowActionMenu, showActionMenu]);

  const [activeLoaderButton, setActiveLoaderButton] = useState(false);

  const deleteViewApplicationNote = useCallback(async () => {
    try {
      await dispatch(deleteApplicationNoteAction(currentNoteId, () => callBack()));
    } catch (e) {
      /**/
    }
  }, [currentNoteId, callBack]);

  const noteCRUDButtons = useMemo(
    () => [
      { title: 'Close', buttonType: 'primary-1', onClick: onCloseNotePopup },
      {
        title: `${selectedApplicationNote.type === 'EDIT' ? 'Edit' : 'Add'} `,
        buttonType: 'primary',
        onClick: addOrUpdateNote,
        isLoading: activeLoaderButton,
      },
    ],
    [onCloseNotePopup, addOrUpdateNote, selectedApplicationNote.type, activeLoaderButton]
  );
  const deleteNoteButtons = useMemo(
    () => [
      { title: 'Close', buttonType: 'primary-1', onClick: toggleConfirmationModal },
      {
        title: 'Delete',
        buttonType: 'danger',
        onClick: deleteViewApplicationNote,
        isLoading: viewApplicationDeleteNoteButtonLoaderAction,
      },
    ],
    [
      toggleConfirmationModal,
      currentNoteId,
      callBack,
      deleteViewApplicationNote,
      viewApplicationDeleteNoteButtonLoaderAction,
    ]
  );

  useEffect(() => {
    if (selectedApplicationNote.type === 'EDIT')
      setActiveLoaderButton(viewApplicationEditNoteButtonLoaderAction);
    else setActiveLoaderButton(viewApplicationAddNewNoteButtonLoaderAction);
  }, [
    selectedApplicationNote.type,
    setActiveLoaderButton,
    viewApplicationEditNoteButtonLoaderAction,
    viewApplicationAddNewNoteButtonLoaderAction,
  ]);

  return (
    <>
      {applicationNoteList !== undefined && (
        <AccordionItem
          index={index}
          header="Note"
          count={
            applicationNoteList?.length < 10
              ? `0${applicationNoteList?.length}`
              : applicationNoteList?.length
          }
          suffix="expand_more"
        >
          {status.value !== 'APPROVED' && status.value !== 'DECLINED' && (
            <Button
              buttonType="primary-1"
              title="Add Note"
              className="add-note-button"
              onClick={toggleModifyNotes}
            />
          )}
          {applicationNoteList?.length > 0 ? (
            applicationNoteList.map(note => (
              <div className="common-accordion-item-content-box" key={note._id}>
                <div className="d-flex just-bet align-center">
                  <div>
                    <span className="title font-field mr-5">Date:</span>
                    <span className="details font-primary">
                      {moment(note.createdAt).format('DD-MMM-YYYY')}
                    </span>
                  </div>
                  <span
                    className="material-icons-round font-placeholder cursor-pointer"
                    onClick={e => onClickActionToggleButton(e, note)}
                  >
                    more_vert
                  </span>
                </div>
                <div className="d-flex">
                  <span className="font-field mr-5">Owner:</span>
                  <Tooltip
                    overlayClassName="tooltip-left-class"
                    overlay={note.createdById || 'No owner name added'}
                    placement="left"
                  >
                    <span className="note-owner-name">{note.createdById || '-'}</span>
                  </Tooltip>
                </div>
                <NotesDescription description={note?.description} />
              </div>
            ))
          ) : (
            <div className="no-record-found">Nothing To Show</div>
          )}
        </AccordionItem>
      )}
      {modifyNoteModal && (
        <Modal
          header={`${selectedApplicationNote.type === 'EDIT' ? 'Edit Note' : 'Add Note'} `}
          className="add-notes-modal"
          buttons={noteCRUDButtons}
        >
          <div className="add-notes-popup-container">
            <span>Description</span>
            <textarea
              placeholder="Note description"
              name="description"
              rows={5}
              value={selectedApplicationNote.description}
              onChange={onChangeSelectedNoteInput}
            />
          </div>
        </Modal>
      )}
      {showActionMenu && (
        <DropdownMenu
          style={menuPosition}
          menuClass="view-application-accordion-dropdown"
          toggleMenu={setShowActionMenu}
        >
          <div className="menu-name" onClick={onEditNoteClick}>
            <span className="material-icons-round">edit</span> Edit
          </div>
          <div className="menu-name" onClick={onDeleteNoteClick}>
            <span className="material-icons-round">delete_outline</span> Delete
          </div>
        </DropdownMenu>
      )}
      {showConfirmModal && (
        <Modal header="Delete Note" buttons={deleteNoteButtons} hideModal={toggleConfirmationModal}>
          <span className="confirmation-message">Are you sure you want to delete this Note?</span>
        </Modal>
      )}
    </>
  );
};

export default React.memo(ApplicationNotesAccordion);

ApplicationNotesAccordion.propTypes = {
  applicationId: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
};
