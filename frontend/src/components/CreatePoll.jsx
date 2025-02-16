import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  IconButton,
  useToast,
  Card,
  CardBody,
  Text,
  Flex,
  FormErrorMessage,
  Tooltip,
  Switch,
  FormHelperText,
} from '@chakra-ui/react';
import axios from 'axios';

function CreatePoll() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [allowMultipleAnswers, setAllowMultipleAnswers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({ question: false, options: {} });
  const navigate = useNavigate();
  const toast = useToast();

  const isQuestionValid = question.trim().length >= 5;
  const areOptionsValid = options.every((opt, index) => 
    !touched.options[index] || opt.trim().length >= 1
  );
  const hasMinOptions = options.filter(opt => opt.trim()).length >= 2;

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    } else {
      toast({
        title: 'Maximum options reached',
        description: 'You can have up to 6 options',
        status: 'info',
        duration: 3000,
      });
    }
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    setTouched(prev => ({
      ...prev,
      options: { ...prev.options, [index]: true }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isQuestionValid || !hasMinOptions) {
      toast({
        title: 'Validation Error',
        description: 'Please check all fields are filled correctly',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const validOptions = options.filter(opt => opt.trim());
      const response = await axios.post('http://localhost:5000/api/polls', {
        question,
        options: validOptions,
        allowMultipleAnswers
      });
      toast({
        title: 'Success!',
        description: 'Your poll has been created',
        status: 'success',
        duration: 3000,
      });
      navigate(`/poll/${response.data._id}`);
    } catch (error) {
      console.error('Error creating poll:', error);
      toast({
        title: 'Error',
        description: 'Failed to create poll',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading color="blue.600">Create New Poll</Heading>
        <IconButton
          icon={<Text fontSize="xl">←</Text>}
          onClick={() => navigate('/')}
          variant="ghost"
          aria-label="Back to polls"
        />
      </Flex>

      <form onSubmit={handleSubmit}>
        <VStack spacing={6} align="stretch">
          <FormControl 
            isRequired 
            isInvalid={touched.question && !isQuestionValid}
          >
            <FormLabel>Question</FormLabel>
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onBlur={() => setTouched(prev => ({ ...prev, question: true }))}
              placeholder="Enter your question"
              size="lg"
            />
            <FormErrorMessage>
              Question must be at least 5 characters long
            </FormErrorMessage>
          </FormControl>

          <Card variant="outline">
            <CardBody>
              <VStack spacing={4} align="stretch">
                {options.map((option, index) => (
                  <FormControl
                    key={index}
                    isRequired
                    isInvalid={touched.options[index] && !option.trim()}
                  >
                    <Flex gap={2}>
                      <Input
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        size="lg"
                      />
                      {options.length > 2 && (
                        <Tooltip label="Remove option">
                          <IconButton
                            icon={<Text fontSize="xl">×</Text>}
                            onClick={() => handleRemoveOption(index)}
                            aria-label="Remove option"
                            colorScheme="red"
                            variant="ghost"
                          />
                        </Tooltip>
                      )}
                    </Flex>
                    <FormErrorMessage>
                      Option cannot be empty
                    </FormErrorMessage>
                  </FormControl>
                ))}
              </VStack>

              {options.length < 6 && (
                <Button
                  onClick={handleAddOption}
                  colorScheme="teal"
                  variant="ghost"
                  width="100%"
                  mt={4}
                  leftIcon={<Text fontSize="xl">+</Text>}
                >
                  Add Option
                </Button>
              )}
            </CardBody>
          </Card>

          <FormControl>
            <Flex align="center" gap={3}>
              <Switch
                id="multiple-answers"
                isChecked={allowMultipleAnswers}
                onChange={(e) => setAllowMultipleAnswers(e.target.checked)}
                colorScheme="blue"
                size="lg"
              />
              <FormLabel htmlFor="multiple-answers" mb="0">
                Allow Multiple Answers
              </FormLabel>
            </Flex>
            <FormHelperText>
              If enabled, users can select multiple options when voting
            </FormHelperText>
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            size="lg"
            isLoading={isSubmitting}
            loadingText="Creating Poll..."
            isDisabled={!isQuestionValid || !hasMinOptions}
          >
            Create Poll
          </Button>
        </VStack>
      </form>
    </Box>
  );
}

export default CreatePoll;
