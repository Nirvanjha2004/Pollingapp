import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Heading,
  VStack,
  Text,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Flex,
  useColorModeValue,
  Skeleton,
  useToast,
} from '@chakra-ui/react';
import { pollsApi } from '../services/api';

function PollList() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cardBg = useColorModeValue('white', 'gray.700');
  const toast = useToast();

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await pollsApi.getPolls();
        setPolls(data);
      } catch (err) {
        setError('Failed to fetch polls. Please try again later.');
        toast({
          title: 'Error',
          description: 'Failed to fetch polls. Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
    // Set up polling for real-time updates
    const pollInterval = setInterval(fetchPolls, 5000);
    return () => clearInterval(pollInterval);
  }, [toast]);

  if (loading) {
    return (
      <VStack spacing={4} align="stretch" w="100%" maxW="800px" mx="auto" p={4}>
        {[1, 2, 3].map((n) => (
          <Skeleton key={n} height="100px" />
        ))}
      </VStack>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" p={4}>
        <Text color="red.500">{error}</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={4} align="stretch" w="100%" maxW="800px" mx="auto" p={4}>
      <Heading mb={4}>Active Polls</Heading>
      {polls.length === 0 ? (
        <Card bg={cardBg}>
          <CardBody>
            <Text>No polls available. Create one!</Text>
          </CardBody>
        </Card>
      ) : (
        polls.map((poll) => (
          <Link key={poll._id} to={`/poll/${poll._id}`}>
            <Card
              bg={cardBg}
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
              }}
              transition="all 0.2s"
            >
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="md">{poll.question}</Heading>
                  <Badge
                    colorScheme={poll.allowMultipleAnswers ? 'purple' : 'blue'}
                    ml={2}
                  >
                    {poll.allowMultipleAnswers ? 'Multiple Choice' : 'Single Choice'}
                  </Badge>
                </Flex>
              </CardHeader>
              <CardBody pt={0}>
                <Text color="gray.500">
                  {poll.options.length} options • {getTotalVotes(poll)} votes
                </Text>
              </CardBody>
            </Card>
          </Link>
        ))
      )}
    </VStack>
  );
}

function getTotalVotes(poll) {
  return poll.options.reduce((total, option) => total + option.votes, 0);
}

export default PollList;
