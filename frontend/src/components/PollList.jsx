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
} from '@chakra-ui/react';
import axios from 'axios';

function PollList() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const cardBg = useColorModeValue('white', 'gray.700');

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/polls');
        setPolls(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching polls:', error);
        setLoading(false);
      }
    };

    fetchPolls();
    const interval = setInterval(fetchPolls, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Box>
        <Heading mb={6}>Active Polls</Heading>
        <VStack spacing={4} align="stretch">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height="120px" rounded="lg" />
          ))}
        </VStack>
      </Box>
    );
  }

  return (
    <Box>
      <Heading mb={6} color="blue.600">Active Polls</Heading>
      <VStack spacing={4} align="stretch">
        {polls.map((poll) => {
          const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
          
          return (
            <Link key={poll._id} to={`/poll/${poll._id}`}>
              <Card
                bg={cardBg}
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: 'lg',
                }}
                transition="all 0.2s"
              >
                <CardHeader pb={2}>
                  <Heading size="md" color="blue.500">{poll.question}</Heading>
                </CardHeader>
                <CardBody pt={2}>
                  <Flex gap={2} mb={2}>
                    <Badge colorScheme="blue">
                      {poll.options.length} options
                    </Badge>
                    <Badge colorScheme="green">
                      {totalVotes} votes
                    </Badge>
                  </Flex>
                  <Text color="gray.600" fontSize="sm">
                    Click to vote or view results
                  </Text>
                </CardBody>
              </Card>
            </Link>
          );
        })}
        {polls.length === 0 && (
          <Card p={6} textAlign="center">
            <Text color="gray.500">No active polls. Create one!</Text>
          </Card>
        )}
      </VStack>
    </Box>
  );
}

export default PollList;
