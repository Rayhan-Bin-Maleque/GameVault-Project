
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { randomUUID } from 'node:crypto';

import {
  User,
  UserRole,
} from '../users/entities/user.entity.js';

import {
  SupportTicket,
  TicketStatus,
  TicketPriority,
} from './entities/support-ticket.entity.js';

import { SupportMessage } from './entities/support-message.entity.js';

import { CreateTicketDto } from './dto/create-ticket.dto.js';
import { CreateMessageDto } from './dto/create-message.dto.js';

import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto.js';
import { UpdateTicketPriorityDto } from './dto/update-ticket-priority.dto.js';

import { AssignTicketDto } from './dto/assign-ticket.dto.js';

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(SupportTicket)
    private readonly ticketRepository: Repository<SupportTicket>,

    @InjectRepository(SupportMessage)
    private readonly messageRepository: Repository<SupportMessage>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  

  
  private generateTicketNumber(): string {
    const year = new Date().getFullYear();

    const uniquePart = randomUUID()
      .slice(0, 8)
      .toUpperCase();

    return `GV-${year}-${uniquePart}`;
  }

  

  private async getActiveCustomer(
    customerId: string,
  ): Promise<User> {
    const customer = await this.userRepository.findOne({
      where: {
        id: customerId,
      },
      select: {
        id: true,
        role: true,
        isActive: true,
      },
    });

    if (!customer) {
      throw new NotFoundException(
        'Customer account not found',
      );
    }

    if (
      customer.role !== UserRole.CUSTOMER ||
      !customer.isActive
    ) {
      throw new ForbiddenException(
        'Only active customers can perform this action',
      );
    }

    return customer;
  }

  
  private async getActiveSupportAgent(
    agentId: string,
  ): Promise<User> {
    const agent = await this.userRepository.findOne({
      where: {
        id: agentId,
      },
      select: {
        id: true,
        role: true,
        isActive: true,
      },
    });

    if (!agent) {
      throw new NotFoundException(
        'Support Agent not found',
      );
    }

    if (
      agent.role !== UserRole.SUPPORT ||
      !agent.isActive
    ) {
      throw new ForbiddenException(
        'Only active Support Agents can perform this action',
      );
    }

    return agent;
  }

 
  private async getActiveAdmin(
    adminId: string,
  ): Promise<User> {
    const admin = await this.userRepository.findOne({
      where: {
        id: adminId,
      },
      select: {
        id: true,
        role: true,
        isActive: true,
      },
    });

    if (!admin) {
      throw new NotFoundException(
        'Admin account not found',
      );
    }

    if (
      admin.role !== UserRole.ADMIN ||
      !admin.isActive
    ) {
      throw new ForbiddenException(
        'Only active Admin users can perform this action',
      );
    }

    return admin;
  }

 

 

  async createTicket(
    customerId: string,
    createTicketDto: CreateTicketDto,
  ): Promise<SupportTicket> {

    const customer = await this.getActiveCustomer(
      customerId,
    );

    

    if (
      createTicketDto.priority === TicketPriority.URGENT
    ) {
      throw new ForbiddenException(
        'Customers cannot create urgent support tickets',
      );
    }

    const ticket = this.ticketRepository.create({
      ticketNumber: this.generateTicketNumber(),

      subject: createTicketDto.subject,

      description: createTicketDto.description,

      category: createTicketDto.category,

      priority: createTicketDto.priority,

      status: TicketStatus.OPEN,

      customer,

      assignedTo: null,

      resolvedAt: null,

      reopenRequestedAt: null,
    });

    return await this.ticketRepository.save(ticket);
  }

 
  async getMyTickets(
    customerId: string,
  ): Promise<SupportTicket[]> {

    await this.getActiveCustomer(customerId);

    return await this.ticketRepository.find({
      where: {
        customer: {
          id: customerId,
        },
      },

      order: {
        createdAt: 'DESC',
      },
    });
  }

 
  async getMyTicketById(
    customerId: string,
    ticketId: string,
  ): Promise<SupportTicket> {

    await this.getActiveCustomer(customerId);

    const ticket = await this.ticketRepository.findOne({
      where: {
        id: ticketId,

        customer: {
          id: customerId,
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException(
        'Support ticket not found',
      );
    }

    return ticket;
  }


  
 



  async createCustomerMessage(
    customerId: string,
    ticketId: string,
    createMessageDto: CreateMessageDto,
  ): Promise<SupportMessage> {

    const customer = await this.getActiveCustomer(
      customerId,
    );

 
    const ticket = await this.ticketRepository.findOne({
      where: {
        id: ticketId,

        customer: {
          id: customerId,
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException(
        'Support ticket not found',
      );
    }

    
    if (
      ticket.status === TicketStatus.RESOLVED ||
      ticket.status === TicketStatus.CLOSED
    ) {
      throw new BadRequestException(
        'This ticket cannot receive messages. Please request reopening if eligible.',
      );
    }

    const message = this.messageRepository.create({
      ticket,

      sender: customer,

      message: createMessageDto.message,
    });

    return await this.messageRepository.save(message);
  }

  
  async getTicketMessages(
    userId: string,
    userRole: UserRole,
    ticketId: string,
  ): Promise<SupportMessage[]> {

    let ticket: SupportTicket | null;

    if (userRole === UserRole.CUSTOMER) {

      await this.getActiveCustomer(userId);

      ticket = await this.ticketRepository.findOne({
        where: {
          id: ticketId,

          customer: {
            id: userId,
          },
        },
      });

    } else if (userRole === UserRole.SUPPORT) {

      await this.getActiveSupportAgent(userId);

      ticket = await this.ticketRepository.findOne({
        where: {
          id: ticketId,

          assignedTo: {
            id: userId,
          },
        },
      });

    } else {
      throw new ForbiddenException(
        'You are not allowed to view this conversation',
      );
    }

    if (!ticket) {
      throw new NotFoundException(
        'Support ticket not found',
      );
    }

    return await this.messageRepository
      .createQueryBuilder('message')
      .innerJoin('message.ticket', 'ticket')
      .leftJoin('message.sender', 'sender')
      .addSelect([
        'sender.id',
        'sender.fullName',
        'sender.role',
      ])
      .where('ticket.id = :ticketId', {
        ticketId,
      })
      .orderBy('message.createdAt', 'ASC')
      .getMany();
  }



  
  async getAssignedTickets(
    agentId: string,
  ): Promise<SupportTicket[]> {

    await this.getActiveSupportAgent(agentId);

    return await this.ticketRepository
      .createQueryBuilder('ticket')
      .innerJoin(
        'ticket.assignedTo',
        'agent',
        'agent.id = :agentId',
        { agentId },
      )
      .addSelect([
        'agent.id',
        'agent.fullName',
        'agent.email',
      ])
      .leftJoin('ticket.customer', 'customer')
      .addSelect([
        'customer.id',
        'customer.fullName',
        'customer.email',
      ])
      .orderBy('ticket.updatedAt', 'DESC')
      .getMany();
  }

  
  async getAssignedTicketById(
    agentId: string,
    ticketId: string,
  ): Promise<SupportTicket> {

    await this.getActiveSupportAgent(agentId);

    const ticket = await this.ticketRepository
      .createQueryBuilder('ticket')
      .innerJoin(
        'ticket.assignedTo',
        'agent',
        'agent.id = :agentId',
        { agentId },
      )
      .addSelect([
        'agent.id',
        'agent.fullName',
        'agent.email',
      ])
      .leftJoin('ticket.customer', 'customer')
      .addSelect([
        'customer.id',
        'customer.fullName',
        'customer.email',
      ])
      .where('ticket.id = :ticketId', {
        ticketId,
      })
      .getOne();

    if (!ticket) {
      throw new NotFoundException(
        'Assigned support ticket not found',
      );
    }

    return ticket;
  }




  async createAgentReply(
    agentId: string,
    ticketId: string,
    createMessageDto: CreateMessageDto,
  ): Promise<SupportMessage> {

    const agent = await this.getActiveSupportAgent(
      agentId,
    );

    const ticket = await this.ticketRepository.findOne({
      where: {
        id: ticketId,

        assignedTo: {
          id: agentId,
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException(
        'Assigned support ticket not found',
      );
    }

    if (
      ticket.status === TicketStatus.RESOLVED ||
      ticket.status === TicketStatus.CLOSED
    ) {
      throw new BadRequestException(
        'Cannot reply to a resolved or closed ticket',
      );
    }

    const message = this.messageRepository.create({
      ticket,

      sender: agent,

      message: createMessageDto.message,
    });

    return await this.messageRepository.save(message);
  }

 

  



  async updateTicketStatus(
    agentId: string,
    ticketId: string,
    updateTicketStatusDto: UpdateTicketStatusDto,
  ): Promise<SupportTicket> {

    await this.getActiveSupportAgent(agentId);

    const ticket = await this.ticketRepository.findOne({
      where: {
        id: ticketId,

        assignedTo: {
          id: agentId,
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException(
        'Assigned support ticket not found',
      );
    }

    const newStatus = updateTicketStatusDto.status;

    
    if (newStatus === TicketStatus.OPEN) {
      throw new BadRequestException(
        'Support Agents cannot directly set a ticket to OPEN',
      );
    }


    if (ticket.status === TicketStatus.CLOSED) {
      throw new BadRequestException(
        'Closed tickets cannot be modified',
      );
    }

    
    if (
      ticket.status === TicketStatus.RESOLVED &&
      newStatus !== TicketStatus.RESOLVED &&
      newStatus !== TicketStatus.CLOSED
    ) {
      throw new BadRequestException(
        'Resolved tickets must be reopened through the reopening workflow',
      );
    }

    ticket.status = newStatus;

    
    if (
      newStatus === TicketStatus.RESOLVED &&
      !ticket.resolvedAt
    ) {
      ticket.resolvedAt = new Date();
    }

    return await this.ticketRepository.save(ticket);
  }

 

  
  async updateTicketPriority(
    agentId: string,
    ticketId: string,
    updateTicketPriorityDto: UpdateTicketPriorityDto,
  ): Promise<SupportTicket> {

    await this.getActiveSupportAgent(agentId);

    const ticket = await this.ticketRepository.findOne({
      where: {
        id: ticketId,

        assignedTo: {
          id: agentId,
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException(
        'Assigned support ticket not found',
      );
    }

    if (
      ticket.status === TicketStatus.RESOLVED ||
      ticket.status === TicketStatus.CLOSED
    ) {
      throw new BadRequestException(
        'Priority cannot be changed on a resolved or closed ticket',
      );
    }

    ticket.priority = updateTicketPriorityDto.priority;

    return await this.ticketRepository.save(ticket);
  }

  
  async assignTicket(
    adminId: string,
    ticketId: string,
    assignTicketDto: AssignTicketDto,
  ): Promise<SupportTicket> {

    await this.getActiveAdmin(adminId);

    const ticket = await this.ticketRepository.findOne({
      where: {
        id: ticketId,
      },
    });

    if (!ticket) {
      throw new NotFoundException(
        'Support ticket not found',
      );
    }

    if (
      ticket.status === TicketStatus.RESOLVED ||
      ticket.status === TicketStatus.CLOSED
    ) {
      throw new BadRequestException(
        'Resolved or closed tickets cannot be assigned',
      );
    }

    const agent = await this.getActiveSupportAgent(
      assignTicketDto.supportAgentId,
    );

    ticket.assignedTo = agent;

    ticket.status = TicketStatus.ASSIGNED;

    ticket.resolvedAt = null;

    return await this.ticketRepository.save(ticket);
  }

 



  private async countAgentTickets(
    agentId: string,
    status?: TicketStatus,
    priority?: TicketPriority,
  ): Promise<number> {

    const query = this.ticketRepository
      .createQueryBuilder('ticket')
      .innerJoin(
        'ticket.assignedTo',
        'agent',
        'agent.id = :agentId',
        { agentId },
      );

    if (status) {
      query.andWhere('ticket.status = :status', {
        status,
      });
    }

    if (priority) {
      query.andWhere('ticket.priority = :priority', {
        priority,
      });
    }

    return await query.getCount();
  }

  async getAgentDashboard(agentId: string) {

    await this.getActiveSupportAgent(agentId);

    const [
      totalAssigned,
      openTickets,
      assignedTickets,
      inProgressTickets,
      waitingForCustomerTickets,
      resolvedTickets,
      closedTickets,
      urgentTickets,
    ] = await Promise.all([

      this.countAgentTickets(agentId),

      this.countAgentTickets(
        agentId,
        TicketStatus.OPEN,
      ),

      this.countAgentTickets(
        agentId,
        TicketStatus.ASSIGNED,
      ),

      this.countAgentTickets(
        agentId,
        TicketStatus.IN_PROGRESS,
      ),

      this.countAgentTickets(
        agentId,
        TicketStatus.WAITING_FOR_CUSTOMER,
      ),

      this.countAgentTickets(
        agentId,
        TicketStatus.RESOLVED,
      ),

      this.countAgentTickets(
        agentId,
        TicketStatus.CLOSED,
      ),

      this.countAgentTickets(
        agentId,
        undefined,
        TicketPriority.URGENT,
      ),
    ]);

    return {
      totalAssigned,
      openTickets,
      assignedTickets,
      inProgressTickets,
      waitingForCustomerTickets,
      resolvedTickets,
      closedTickets,
      urgentTickets,
    };
  }



  private async countTicketsByStatus(
    status: TicketStatus,
  ): Promise<number> {

    return await this.ticketRepository.count({
      where: {
        status,
      },
    });
  }

  
  private async countTicketsByPriority(
    priority: TicketPriority,
  ): Promise<number> {

    return await this.ticketRepository.count({
      where: {
        priority,
      },
    });
  }

  


  async getAllTickets(
    adminId: string,
  ): Promise<SupportTicket[]> {

    await this.getActiveAdmin(adminId);

    return await this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoin('ticket.customer', 'customer')
      .addSelect([
        'customer.id',
        'customer.fullName',
        'customer.email',
      ])
      .leftJoin('ticket.assignedTo', 'agent')
      .addSelect([
        'agent.id',
        'agent.fullName',
        'agent.email',
      ])
      .orderBy('ticket.createdAt', 'DESC')
      .getMany();
  }

  


  async getAdminDashboard(adminId: string) {

    await this.getActiveAdmin(adminId);

    const [
      totalTickets,
      unassignedTickets,
      assignedTickets,

      openTickets,
      assignedStatusTickets,
      inProgressTickets,
      waitingForCustomerTickets,
      resolvedTickets,
      closedTickets,

      lowPriorityTickets,
      mediumPriorityTickets,
      highPriorityTickets,
      urgentTickets,

      activeSupportAgents,
    ] = await Promise.all([

      
      this.ticketRepository.count(),

    

      this.ticketRepository
        .createQueryBuilder('ticket')
        .leftJoin('ticket.assignedTo', 'agent')
        .where('agent.id IS NULL')
        .getCount(),

      
      this.ticketRepository
        .createQueryBuilder('ticket')
        .innerJoin('ticket.assignedTo', 'agent')
        .getCount(),

     

      this.countTicketsByStatus(
        TicketStatus.OPEN,
      ),

      this.countTicketsByStatus(
        TicketStatus.ASSIGNED,
      ),

      this.countTicketsByStatus(
        TicketStatus.IN_PROGRESS,
      ),

      this.countTicketsByStatus(
        TicketStatus.WAITING_FOR_CUSTOMER,
      ),

      this.countTicketsByStatus(
        TicketStatus.RESOLVED,
      ),

      this.countTicketsByStatus(
        TicketStatus.CLOSED,
      ),

      
      this.countTicketsByPriority(
        TicketPriority.LOW,
      ),

      this.countTicketsByPriority(
        TicketPriority.MEDIUM,
      ),

      this.countTicketsByPriority(
        TicketPriority.HIGH,
      ),

      this.countTicketsByPriority(
        TicketPriority.URGENT,
      ),

      
      this.userRepository.count({
        where: {
          role: UserRole.SUPPORT,
          isActive: true,
        },
      }),
    ]);

    return {
      totalTickets,

      unassignedTickets,

      assignedTickets,

      openTickets,

      assignedStatusTickets,

      inProgressTickets,

      waitingForCustomerTickets,

      resolvedTickets,

      closedTickets,

      lowPriorityTickets,

      mediumPriorityTickets,

      highPriorityTickets,

      urgentTickets,

      activeSupportAgents,
    };
  }

  


  async requestReopenTicket(
    customerId: string,
    ticketId: string,
  ): Promise<SupportTicket> {

    
    await this.getActiveCustomer(customerId);

    


    const ticket = await this.ticketRepository.findOne({
      where: {
        id: ticketId,

        customer: {
          id: customerId,
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException(
        'Support ticket not found',
      );
    }



    if (ticket.status !== TicketStatus.RESOLVED) {
      throw new BadRequestException(
        'Only resolved tickets can be submitted for reopening',
      );
    }

  
    if (ticket.reopenRequestedAt) {
      throw new ConflictException(
        'A reopening request has already been submitted',
      );
    }



    ticket.reopenRequestedAt = new Date();

    
    return await this.ticketRepository.save(ticket);
  }
}
