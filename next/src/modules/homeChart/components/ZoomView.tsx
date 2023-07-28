import { Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import showNotification from '../utils/helpers/showNotification';
import Chart from './Chart';
import Feedback from './Feedback';

import { Choice } from '@/lib/orm/entity/DataCheck';
import { SelectedChartData, SelectedHistoryChartData } from '@/types/common';

interface Props {
  zoomMode: boolean;
  chartData: SelectedChartData | SelectedHistoryChartData;
  isOpen: boolean;
  isFetching: boolean;
  onClose: () => void;
  addFeedback: (index: number | string, choice: Choice) => void;
}

const ZoomView: React.FC<Props> = ({
  zoomMode,
  chartData,
  isOpen,
  isFetching,
  onClose,
  addFeedback,
}) => {
  const [isConfirmModal, setIsConfirmModal] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<Choice | null>(null);

  const { id, fragment, data, decision } = chartData;
  const { label, position, exam_uid } = fragment;

  const handleDecision = (choice: Choice) => {
    if (decision?.choice === choice) {
      return;
    }

    if (decision) {
      setSelectedDecision(choice);
      setIsConfirmModal(true);

      return;
    }

    if (!id) {
      return;
    }

    addFeedback(id, choice);
  };

  const handleConfirm = () => {
    if (!decision || !selectedDecision) {
      return;
    }

    if (!decision.id) {
      return;
    }

    addFeedback(decision.id, selectedDecision);
    setIsConfirmModal(false);
  };

  const handleCancel = () => {
    setIsConfirmModal(false);
  };

  useEffect(() => {
    if (!chartData || isFetching || !isOpen) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'n':
          addFeedback(id, Choice.APPROVED);
          showNotification('success');

          if (!zoomMode) {
            onClose();
          }

          break;
        case 'x':
          addFeedback(id, Choice.REJECTED);
          showNotification('error');

          if (!zoomMode) {
            onClose();
          }

          break;
        case 'y':
          addFeedback(id, Choice.UNKNOWN);
          showNotification(Choice.UNKNOWN);

          if (!zoomMode) {
            onClose();
          }

          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [id, addFeedback, chartData, zoomMode, isFetching, isOpen]);

  return (
    <>
      <Modal
        title="Confirmation"
        centered
        open={isConfirmModal}
        onOk={handleConfirm}
        onCancel={handleCancel}
      >
        <p>Are you sure you want to change the label?</p>
      </Modal>

      <Modal
        centered
        open={isOpen}
        onCancel={onClose}
        width={1000}
        footer={null}
      >
        <ModalBody>
          <Wrapper>
            <ChartsWrapper>
              {data &&
                data.datasets.map((dataset) => {
                  const lineProps = {
                    labels: data.labels,
                    datasets: [{ ...dataset }],
                  };
                  return (
                    <ChartContainer key={dataset.label}>
                      <Chart data={lineProps} />
                    </ChartContainer>
                  );
                })}
            </ChartsWrapper>

            <ButtonWrapper>
              <Feedback
                isFetching={isFetching}
                isZoomView={true}
                handleSelect={handleDecision}
                decision={decision?.choice}
              />
            </ButtonWrapper>
          </Wrapper>

          <AdditionalWrapper>
            <FragmentTitle>
              Label: <FragmentInfo>{label}</FragmentInfo>
            </FragmentTitle>
            <FragmentTitle>
              Position: <FragmentInfo>{position}</FragmentInfo>
            </FragmentTitle>
            <FragmentTitle>
              Exam UID: <FragmentInfo>{exam_uid}</FragmentInfo>
            </FragmentTitle>
          </AdditionalWrapper>
        </ModalBody>
      </Modal>
    </>
  );
};

export default ZoomView;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;

const ChartsWrapper = styled.div`
  width: 100%;
`;

const ChartContainer = styled.div`
  margin-bottom: 2px;
`;

const ButtonWrapper = styled.div`
  height: 450px;
  width: 60px;
`;

const AdditionalWrapper = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  padding-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: space-between;
  gap: 20px;
  border: 2px solid black;
  border-radius: 8px;
`;

const FragmentTitle = styled.b`
  font-size: 20px;
`;

const FragmentInfo = styled.span`
  font-weight: normal;
`;
