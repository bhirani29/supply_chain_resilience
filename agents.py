from mesa import Agent
import numpy as np

class SupplierAgent(Agent):
    def __init__(self, unique_id, model):
        super().__init__(unique_id, model)
        self.inventory = 100

    def step(self):
        reduction = np.random.randint(5, 10)
        self.inventory = max(0, self.inventory - reduction)
        if self.inventory == 0:
            self.inventory += 50  # Restock immediately at 0
            self.model.messages.append({
                "agent_id": self.unique_id,
                "type": "restock",
                "quantity": 50
            })
        elif self.inventory < 20:
            self.send_message({"type": "low_inventory", "stock": self.inventory})
        if np.random.random() < 0.1:  # Additional 10% chance to restock
            self.inventory += 50
        self.model.log_data(self.unique_id, "inventory", self.inventory)

    def send_message(self, message):
        message["agent_id"] = self.unique_id
        self.model.messages.append(message)

class RetailerAgent(Agent):
    def __init__(self, unique_id, model):
        super().__init__(unique_id, model)
        self.stock = 50
        self.demand = 10

    def step(self):
        self.stock = max(0, self.stock - self.demand)
        if self.stock < 10:
            self.send_message({"type": "order", "quantity": 50})
            # Try all suppliers for fulfillment
            for agent in self.model.schedule.agents:
                if isinstance(agent, SupplierAgent) and agent.inventory >= 50:
                    agent.inventory = max(0, agent.inventory - 50)
                    self.stock += 50
                    self.model.messages.append({
                        "agent_id": agent.unique_id,
                        "type": "fulfillment",
                        "quantity": 50,
                        "to": self.unique_id
                    })
                    break
        self.model.log_data(self.unique_id, "stock", self.stock)

    def send_message(self, message):
        message["agent_id"] = self.unique_id
        self.model.messages.append(message)