import { Box } from '@mui/material';
import React, { useContext, useState } from 'react';
import * as Yup from 'yup';
import ToolImageInput from '@components/input/ToolImageInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { GetGroupsType } from '@components/options/ToolOptions';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import SelectWithDesc from '@components/options/SelectWithDesc';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import CircularProgress from '@mui/material/CircularProgress';
import { extractTextFromImage, getAvailableLanguages } from './service';
import { InitialValuesType } from './types';
import { CustomSnackBarContext } from '../../../../../contexts/CustomSnackBarContext';
import { useBt } from '../../../../../benito/strings';

const initialValues: InitialValuesType = {
  language: 'ita', // BenitoTools: italiano predefinito
  detectParagraphs: true
};

const validationSchema = Yup.object({
  language: Yup.string().required('Language is required')
});

export default function ImageToText({ title }: ToolComponentProps) {
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const bt = useBt();
  const compute = async (optionsValues: InitialValuesType, input: any) => {
    if (!input) return;

    setIsProcessing(true);

    try {
      const extractedText = await extractTextFromImage(input, optionsValues);
      setResult(extractedText);
    } catch (err: any) {
      showSnackBar(
        err.message || bt.ocr.error,
        'error'
      );
      setResult('');
    } finally {
      setIsProcessing(false);
    }
  };

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: bt.ocr.options,
      component: (
        <Box>
          <SelectWithDesc
            selected={values.language}
            onChange={(val) => updateField('language', val)}
            description={bt.ocr.languageDesc}
            options={getAvailableLanguages().map((l) => ({
              ...l,
              label: bt.ocr.languages[l.value as keyof typeof bt.ocr.languages] ?? l.label
            }))}
          />
          <CheckboxWithDesc
            checked={values.detectParagraphs}
            onChange={(value) => updateField('detectParagraphs', value)}
            description={bt.ocr.paragraphsDesc}
            title={bt.ocr.paragraphs}
          />
        </Box>
      )
    }
  ];

  return (
    <ToolContent
      title={title}
      initialValues={initialValues}
      getGroups={getGroups}
      compute={compute}
      input={input}
      validationSchema={validationSchema}
      inputComponent={
        <ToolImageInput
          value={input}
          onChange={setInput}
          accept={['image/jpeg', 'image/png']}
          title={bt.ocr.input}
        />
      }
      resultComponent={
        <ToolTextResult
          title={bt.ocr.result}
          value={result}
          loading={isProcessing}
        />
      }
      toolInfo={{
        title: bt.ocr.infoTitle,
        description: bt.ocr.info
      }}
    />
  );
}
