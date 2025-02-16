import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  VStack,
  Button,
  Progress,
  Text,
  Card,
  CardBody,
  useToast,
  IconButton,
  Flex,
  Badge,
  Skeleton,
  Checkbox,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import axios from 'axios';

function PollDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedOptions, setVotedOptions] = useState([]);

  // Generate a simple user ID if not exists
  const getUserId = () => {
    let userId = localStorage.getItem('pollUserId');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('pollUserId', userId);
    }
    return userId;
  };

  useEffect(() => {
    const fetchPollAndVoteStatus = async () => {
      try {
        const [pollResponse, voteStatusResponse] = await Promise.all([
          axios.get(`http://localhost:5000/api/polls/${id}`),
          axios.get(`http://localhost:5000/api/polls/${id}/check-vote/${getUserId()}`)
        ]);

        setPoll(pollResponse.data);
        setHasVoted(voteStatusResponse.data.hasVoted);
        if (voteStatusResponse.data.hasVoted) {
          setVotedOptions(voteStatusResponse.data.votedOptions);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching poll:', error);
        setLoading(false);
        toast({
          title: 'Error',
          description: 'Failed to load poll',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        navigate('/');
      }
    };

    fetchPollAndVoteStatus();
    const interval = setInterval(fetchPollAndVoteStatus, 5000);
    return () => clearInterval(interval);
  }, [id, navigate, toast]);

  const handleOptionSelect = (optionIndex) => {
    if (poll.allowMultipleAnswers) {
      setSelectedOptions(prev => {
        if (prev.includes(optionIndex)) {
          return prev.filter(i => i !== optionIndex);
        } else {
          return [...prev, optionIndex];
        }
      });
    } else {
      setSelectedOptions([optionIndex]);
    }
  };

  const handleVote = async () => {
    if (isVoting || selectedOptions.length === 0) return;
    
    setIsVoting(true);
    
    try {
      const response = await axios.post(`http://localhost:5000/api/polls/${id}/vote`, {
        userId: getUserId(),
        optionIndices: selectedOptions
      });
      setPoll(response.data);
      setHasVoted(true);
      setVotedOptions(selectedOptions);
      toast({
        title: 'Vote recorded',
        description: 'Thank you for voting!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to record vote',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsVoting(false);
    }
  };

  if (loading) {
    return (
      <Box>
        <Skeleton height="40px" mb={6} />
        <VStack spacing={4} align="stretch">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height="100px" />
          ))}
        </VStack>
      </Box>
    );
  }

  if (!poll) {
    return null;
  }

  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Heading color="blue.600">{poll.question}</Heading>
          {poll.allowMultipleAnswers && (
            <Text color="gray.600" mt={2}>
              You can select multiple options
            </Text>
          )}
        </Box>
        <IconButton
          icon={<Text fontSize="xl">←</Text>}
          onClick={() => navigate('/')}
          variant="ghost"
          aria-label="Back to polls"
        />
      </Flex>

      {hasVoted && (
        <Alert status="success" mb={6}>
          <AlertIcon />
          You have already voted on this poll
        </Alert>
      )}
      
      <VStack spacing={4} align="stretch">
        {poll.options.map((option, index) => {
          const percentage = totalVotes === 0 ? 0 : (option.votes / totalVotes) * 100;
          const isSelected = selectedOptions.includes(index);
          const isVoted = hasVoted && votedOptions.includes(index);
          
          return (
            <Card
              key={index}
              variant="outline"
              borderColor={isSelected || isVoted ? 'blue.200' : 'gray.200'}
              _hover={{ borderColor: 'blue.300' }}
              transition="all 0.2s"
            >
              <CardBody>
                <Flex mb={3} align="center" gap={3}>
                  {!hasVoted && (
                    <Checkbox
                      isChecked={isSelected}
                      onChange={() => handleOptionSelect(index)}
                      colorScheme="blue"
                      size="lg"
                    />
                  )}
                  <Text flex="1" fontSize="lg">
                    {option.text}
                  </Text>
                  {isVoted && (
                    <Badge colorScheme="green">Your vote</Badge>
                  )}
                </Flex>
                <Progress
                  value={percentage}
                  colorScheme="blue"
                  size="sm"
                  rounded="full"
                  mb={2}
                  transition="all 0.2s"
                />
                <Flex justify="space-between" align="center">
                  <Text color="gray.600" fontSize="sm">
                    {option.votes} votes
                  </Text>
                  <Badge
                    colorScheme="blue"
                    variant="subtle"
                    fontSize="sm"
                  >
                    {percentage.toFixed(1)}%
                  </Badge>
                </Flex>
              </CardBody>
            </Card>
          );
        })}
        
        {!hasVoted && (
          <Button
            onClick={handleVote}
            colorScheme="blue"
            size="lg"
            isLoading={isVoting}
            loadingText="Recording vote..."
            isDisabled={selectedOptions.length === 0}
          >
            Submit Vote
          </Button>
        )}

        <Card variant="outline" bg="gray.50">
          <CardBody>
            <Flex justify="center" align="center" gap={2}>
              <Text color="gray.600">Total votes:</Text>
              <Badge colorScheme="green" fontSize="md">
                {totalVotes}
              </Badge>
            </Flex>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}

export default PollDetails;
