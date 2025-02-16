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
  useToast,
  IconButton,
  Flex,
  Switch,
  Card,
  CardBody,
  Icon,
} from '@chakra-ui/react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { pollsApi } from '../services/api';

function CreatePoll() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [allowMultipleAnswers, setAllowMultipleAnswers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index) => {
    if (options.length <= 2) {
      toast({
        title: 'Error',
        description: 'A poll must have at least 2 options',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!question.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a question',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const validOptions = options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      toast({
        title: 'Error',
        description: 'Please enter at least 2 options',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await pollsApi.createPoll({
        question: question.trim(),
        options: validOptions,
        allowMultipleAnswers,
      });

      toast({
        title: 'Success',
        description: 'Poll created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      navigate('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create poll',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box maxW="600px" mx="auto" p={4}>
      <Card>
        <CardBody>
          <VStack spacing={6} as="form" onSubmit={handleSubmit}>
            <Heading size="lg" color="blue.600">Create New Poll</Heading>

            <FormControl isRequired>
              <FormLabel>Question</FormLabel>
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter your question"
              />
            </FormControl>

            <FormControl>
              <Flex align="center" gap={3}>
                <Switch
                  id="multiple-answers"
                  isChecked={allowMultipleAnswers}
                  onChange={(e) => setAllowMultipleAnswers(e.target.checked)}
                />
                <FormLabel htmlFor="multiple-answers" mb="0">
                  Allow Multiple Answers
                </FormLabel>
              </Flex>
            </FormControl>

            <VStack spacing={4} align="stretch" width="100%">
              {options.map((option, index) => (
                <Flex key={index} gap={2}>
                  <FormControl isRequired>
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                    />
                  </FormControl>
                  <IconButton
                    icon={<Icon as={FiTrash2} />}
                    onClick={() => removeOption(index)}
                    colorScheme="red"
                    variant="ghost"
                  />
                </Flex>
              ))}
              
              <Button
                leftIcon={<Icon as={FiPlus} />}
                onClick={addOption}
                size="sm"
                colorScheme="blue"
                variant="ghost"
              >
                Add Option
              </Button>
            </VStack>

            <Button
              type="submit"
              colorScheme="blue"
              width="100%"
              isLoading={isSubmitting}
            >
              Create Poll
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
}

export default CreatePoll;
