import React, { useCallback, useMemo, useReducer, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';
import ReactSelect from 'react-select';
import Tooltip from 'rc-tooltip';
import {
  deleteViewApplicationDocumentAction,
  downloadDocuments,
  getApplicationModuleList,
  viewApplicationUploadDocuments,
} from '../../redux/ApplicationAction';
import AccordionItem from '../../../../common/Accordion/AccordionItem';
import IconButton from '../../../../common/IconButton/IconButton';
import Modal from '../../../../common/Modal/Modal';
import FileUpload from '../../../../common/Header/component/FileUpload';
import Input from '../../../../common/Input/Input';
import { errorNotification } from '../../../../common/Toast';
import { downloadAll } from '../../../../helpers/DownloadHelper';

const initialApplicationDocumentState = {
  description: '',
  fileData: [],
  documentType: [],
};
const APPLICATION_DOCUMENT_REDUCER_ACTIONS = {
  UPDATE_DATA: 'UPDATE_DATA',
  UPDATE_SINGLE_DATA: 'UPDATE_SINGLE_DATA',
  RESET_STATE: 'RESET_STATE',
};

function applicationDocumentReducer(state, action) {
  let stateUpdated;
  switch (action.type) {
    case APPLICATION_DOCUMENT_REDUCER_ACTIONS.UPDATE_SINGLE_DATA:
      if (action.name === 'fileData') {
        const arr = [...state[action.name]];

        if (action.id === undefined || action.id === null) {
          arr.push(action.value);
        } else {
          arr[action.id] = action.value;
        }

        stateUpdated = {
          ...state,
          [action.name]: arr,
        };
      } else {
        stateUpdated = {
          ...state,
          [action.name]: action.value,
        };
      }
      return stateUpdated;
    case APPLICATION_DOCUMENT_REDUCER_ACTIONS.UPDATE_DATA:
      return {
        ...state,
        ...action.data,
      };
    case APPLICATION_DOCUMENT_REDUCER_ACTIONS.RESET_STATE:
      return { ...initialApplicationDocumentState };
    default:
      return state;
  }
}

const ApplicationDocumentsAccordion = props => {
  const dispatch = useDispatch();
  const { applicationId, index } = props;
  const [fileExtensionErrorMessage, setFileExtensionErrorMessage] = useState(false);

  const applicationDocsList = useSelector(
    ({ application }) => application?.viewApplication?.applicationModulesList?.documents || []
  );

  const documentTypeList = useSelector(
    ({ application }) =>
      application?.viewApplication?.applicationModulesList?.viewApplicationDocumentType || []
  );

  const [selectedApplicationDocuments, dispatchSelectedApplicationDocuments] = useReducer(
    applicationDocumentReducer,
    initialApplicationDocumentState
  );

  const {
    viewDocumentUploadDocumentButtonLoaderAction,
    viewDocumentDeleteDocumentButtonLoaderAction,
  } = useSelector(({ generalLoaderReducer }) => generalLoaderReducer ?? false);

  // upload doc
  const [uploadModel, setUploadModel] = useState(false);
  const toggleUploadModel = useCallback(
    value => setUploadModel(value !== undefined ? value : e => !e),

    [setUploadModel]
  );

  const { documentType, description } = useMemo(
    () => selectedApplicationDocuments,
    [selectedApplicationDocuments]
  );

  const documentTypeOptions = useMemo(() => {
    const finalData = documentTypeList || [];
    return finalData.map(e => ({
      name: 'documentType',
      label: e.documentTitle,
      value: e._id,
    }));
  }, [documentTypeList]);

  const handleDocumentChange = useCallback(
    newValue => {
      dispatchSelectedApplicationDocuments({
        type: APPLICATION_DOCUMENT_REDUCER_ACTIONS.UPDATE_SINGLE_DATA,
        name: newValue.name,
        value: newValue,
      });
    },
    [dispatchSelectedApplicationDocuments]
  );
  const onchangeDocumentDescription = useCallback(
    e => {
      dispatchSelectedApplicationDocuments({
        type: APPLICATION_DOCUMENT_REDUCER_ACTIONS.UPDATE_SINGLE_DATA,
        name: e.target.name,
        value: e.target.value,
      });
    },
    [dispatchSelectedApplicationDocuments]
  );

  const onUploadClick = useCallback(
    (e, id) => {
      // e.persist();
      if (e.target.files && e.target.files.length > 0) {
        const fileExtension = [
          'jpeg',
          'jpg',
          'png',
          'bmp',
          'gif',
          'tex',
          'xls',
          'xlsx',
          'csv',
          'doc',
          'docx',
          'odt',
          'txt',
          'pdf',
          'png',
          'pptx',
          'ppt',
          'rtf',
        ];
        const mimeType = [
          'image/jpeg',
          'image/png',
          'application/pdf',
          'image/bmp',
          'image/gif',
          'application/x-tex',
          'application/vnd.ms-excel',
          'text/csv',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.oasis.opendocument.text',
          'text/plain',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'application/vnd.ms-powerpoint',
          'application/rtf',
        ];
        const checkExtension =
          fileExtension.indexOf(e.target.files[0].name.split('.').splice(-1)[0]) !== -1;
        const checkMimeTypes = mimeType.indexOf(e.target.files[0].type) !== -1;

        const checkFileSize = e.target.files[0].size > 10485760;
        if (!(checkExtension || checkMimeTypes)) {
          setFileExtensionErrorMessage(true);
        } else if (checkFileSize) {
          setFileExtensionErrorMessage(false);
          errorNotification('File size should be less than 10MB.');
        } else {
          setFileExtensionErrorMessage(false);
          dispatchSelectedApplicationDocuments({
            type: APPLICATION_DOCUMENT_REDUCER_ACTIONS.UPDATE_SINGLE_DATA,
            name: 'fileData',
            value: e.target.files[0],
            id,
          });
        }
      }
    },
    [dispatchSelectedApplicationDocuments]
  );

  const onCloseUploadDocumentButton = useCallback(() => {
    setFileExtensionErrorMessage(false);
    dispatchSelectedApplicationDocuments({
      type: APPLICATION_DOCUMENT_REDUCER_ACTIONS.RESET_STATE,
    });
    toggleUploadModel();
  }, [toggleUploadModel, dispatchSelectedApplicationDocuments]);

  const onClickUploadDocument = useCallback(async () => {
    setFileExtensionErrorMessage(false);
    if (selectedApplicationDocuments.documentType.length <= 0) {
      errorNotification('Please select document type');
    } else if (!selectedApplicationDocuments.fileData) {
      errorNotification('Please select document to upload');
    } else if (!selectedApplicationDocuments.description) {
      errorNotification('Description is required');
    } else {
      const config = {
        headers: {
          'content-type': 'multipart/form-data',
        },
      };
      const formDataArr = selectedApplicationDocuments.fileData.map(data => {
        const formData = new FormData();
        formData.append('description', selectedApplicationDocuments.description);
        formData.append('documentType', selectedApplicationDocuments.documentType.value);
        formData.append('document', data);
        formData.append('entityId', applicationId);
        formData.append('documentFor', 'application');
        return formData;
      });
      dispatch(
        viewApplicationUploadDocuments(formDataArr, config, () => {
          dispatchSelectedApplicationDocuments({
            type: APPLICATION_DOCUMENT_REDUCER_ACTIONS.RESET_STATE,
          });
          toggleUploadModel();
        })
      );
    }
  }, [
    selectedApplicationDocuments,
    dispatchSelectedApplicationDocuments,
    toggleUploadModel,
    applicationId,
  ]);

  const uploadDocumentButton = useMemo(
    () => [
      {
        title: 'Close',
        buttonType: 'primary-1',
        onClick: onCloseUploadDocumentButton,
      },
      {
        title: 'Upload',
        buttonType: 'primary',
        onClick: onClickUploadDocument,
        isLoading: viewDocumentUploadDocumentButtonLoaderAction,
      },
    ],
    [
      onCloseUploadDocumentButton,
      onClickUploadDocument,
      viewDocumentUploadDocumentButtonLoaderAction,
    ]
  );

  // Delete
  const [applicationDocId, setApplicationDocId] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const toggleConfirmationModal = useCallback(
    value => setShowConfirmModal(value !== undefined ? value : e => !e),
    [setShowConfirmModal]
  );

  const callBack = useCallback(() => {
    toggleConfirmationModal();
    dispatch(getApplicationModuleList(applicationId));
  }, [applicationId]);

  const deleteDocument = useCallback(
    docId => {
      setApplicationDocId(docId);
      setShowConfirmModal(true);
    },
    [showConfirmModal]
  );

  const deleteDocumentButtons = useMemo(
    () => [
      { title: 'Close', buttonType: 'primary-1', onClick: () => toggleConfirmationModal() },
      {
        title: 'Delete',
        buttonType: 'danger',
        onClick: async () => {
          try {
            await dispatch(deleteViewApplicationDocumentAction(applicationDocId, callBack));
          } catch (e) {
            /**/
          }
        },
        isLoading: viewDocumentDeleteDocumentButtonLoaderAction,
      },
    ],
    [toggleConfirmationModal, applicationDocId, viewDocumentDeleteDocumentButtonLoaderAction]
  );

  const onDocumentDownloadClick = useCallback(
    async documentId => {
      const response = await downloadDocuments(documentId);
      if (response) {
        downloadAll(response);
      }
    },
    [downloadAll]
  );

  return (
    <>
      {applicationDocsList !== undefined && (
        <AccordionItem
          index={index}
          header="Documents"
          count={
            applicationDocsList?.length < 10
              ? `0${applicationDocsList?.length}`
              : applicationDocsList?.length
          }
          suffix="expand_more"
        >
          <IconButton
            buttonType="primary-1"
            title="cloud_upload"
            className="add-document-button"
            onClick={() => toggleUploadModel()}
          />
          {applicationDocsList &&
            applicationDocsList.map(doc => (
              <div className="common-accordion-item-content-box">
                <div className="document-title-row">
                  <Tooltip
                    mouseEnterDelay={0.5}
                    overlayClassName="tooltip-left-class"
                    overlay={doc.documentTypeId || 'No document title set'}
                    placement="left"
                  >
                    <div className="document-title">{doc.documentTypeId || '-'}</div>
                  </Tooltip>
                  <div className="view-application-document-action-buttons">
                    <span
                      title="Download this document"
                      className="download-icon material-icons-round"
                      onClick={() => onDocumentDownloadClick(doc?._id)}
                    >
                      cloud_download
                    </span>
                    {doc?.uploadByType === 'client-user' && (
                      <span
                        className="material-icons-round font-danger cursor-pointer"
                        onClick={() => deleteDocument(doc._id)}
                      >
                        delete_outline
                      </span>
                    )}
                  </div>
                </div>
                <div className="date-owner-row">
                  <span className="title mr-5">Date:</span>
                  <span className="details">{moment(doc.createdAt).format('DD-MMM-YYYY')}</span>

                  <span className="title">Owner:</span>
                  <span className="details">{doc.uploadById || '-'}</span>
                </div>
                <div className="d-flex">
                  <div className="font-field">Description:</div>
                  <div className="view-application-accordion-description">
                    {doc.description || '-'}
                  </div>
                </div>
              </div>
            ))}
        </AccordionItem>
      )}
      {uploadModel && (
        <Modal
          header="Upload Documents"
          className="upload-document-modal"
          buttons={uploadDocumentButton}
          hideModal={toggleUploadModel}
        >
          <div className="document-upload-popup-container">
            <span>Document Type</span>
            <ReactSelect
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Select"
              options={documentTypeOptions}
              value={documentType}
              onChange={handleDocumentChange}
              isSearchable
            />
            <span>Please upload your documents here</span>
            <div className="d-flex" style={{ flexDirection: 'column' }}>
              {selectedApplicationDocuments.fileData?.map((data, ind) => (
                <div>
                  <FileUpload
                    id={ind}
                    handleChange={onUploadClick}
                    isProfile={false}
                    fileName={data.name}
                  />
                </div>
              ))}
              <div>
                <FileUpload isProfile={false} fileName="Browse..." handleChange={onUploadClick} />
                {fileExtensionErrorMessage && (
                  <div className="ui-state-error">
                    Only jpeg, jpg, png, bmp, gif, tex, xls, xlsx, csv, doc, docx, odt, txt, pdf,
                    png, pptx, ppt or rtf file types are accepted
                  </div>
                )}
              </div>
            </div>
            <span>Document Description:</span>
            <Input
              prefixClass="font-placeholder"
              placeholder="Document description"
              name="description"
              type="text"
              value={description}
              onChange={onchangeDocumentDescription}
            />
          </div>
        </Modal>
      )}
      {showConfirmModal && (
        <Modal
          header="Delete Document"
          buttons={deleteDocumentButtons}
          hideModal={toggleConfirmationModal}
        >
          <span className="confirmation-message">
            Are you sure you want to delete this document?
          </span>
        </Modal>
      )}
    </>
  );
};

export default React.memo(ApplicationDocumentsAccordion);

ApplicationDocumentsAccordion.propTypes = {
  applicationId: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
};
